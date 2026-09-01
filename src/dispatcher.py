import asyncio
import time
from src.base import BaseComponent
from src.events import ReasoningTrace, RescueComplete
from src.errors import safe_handler
from src.services.arc_pinner import ArcPinner
from src.services.circle_rescuer import CircleRescuer
from src.services.vault_service import VaultService
from src.services.job_service import JobService


class RescueDispatcher(BaseComponent):
    """Orchestrates rescue operations by coordinating pinning and financial actions.

    Attributes:
        pinner (ArcPinner): Service for pinning traces to the Arc network.
        rescuer (CircleRescuer): Service for executing USDC transfers via Circle.
        vault (VaultService): Service for authorizing fund releases on Arc.
        jobs (JobService): Service for ERC-8183 job settlement on Arc.
    """

    def __init__(self):
        """Initializes the dispatcher with services and subscriptions."""
        super().__init__("RescueDispatcher")

        # Load services
        self.pinner = ArcPinner()
        self.rescuer = CircleRescuer()
        self.vault = VaultService()
        self.jobs = JobService()
        
        self.subscribe(ReasoningTrace, self.on_reasoning_trace)

    @safe_handler("RescueDispatcher")
    async def on_reasoning_trace(self, event: ReasoningTrace):
        """Processes a reasoning trace to initiate on-chain and financial actions."""
        self.logger.info("rescue_cycle_start", reason_hash=event.reason_hash)

        # Notify that rescue is initiated
        from src.events import RescueInitiated
        await self.publish(RescueInitiated(
            reason_hash=event.reason_hash,
            amount=event.rescue_amount_usdc,
            target_chain="Arc_Testnet"
        ))

        start_time = time.time()

        # 1. Orchestrate four-pillar rescue: 
        # - Pin (Transparency)
        # - Authorize (Governance)
        # - Job Settle (Commerce/ERC-8183)
        # - Execute (Financial/Circle)
        # We run them in parallel to minimize rescue latency.
        # We run the Arc transparency and governance tasks completely in the background 
        # so they don't block the critical-path financial rescue latency.
        background_tasks = [
            asyncio.create_task(self.pinner.pin(event.reason_hash)),
            asyncio.create_task(self.vault.release_funds(
                amount=event.rescue_amount_usdc,
                recipient=event.account,
                reason_hash=event.reason_hash
            )),
            asyncio.create_task(self.jobs.create_and_settle_rescue_job(
                amount_usdc=event.rescue_amount_usdc,
                reason_hash=event.reason_hash
            ))
        ]
        
        # UI notification only — nothing downstream depends on this completing
        # before the financial rescue starts, so it's scheduled like the other
        # background tasks rather than awaited inline. Previously this sat
        # between task creation and the critical-path await below, meaning a
        # slow/stalled dashboard websocket client (ws_server broadcasts with a
        # 1s timeout per connection) could delay the start of the real money
        # movement for a notification purpose.
        from src.events import BridgeInitiated
        background_tasks.append(asyncio.create_task(self.publish(BridgeInitiated(
            reason_hash=event.reason_hash,
            target_chain="Circle_Gateway"
        ))))

        # CRITICAL PATH: Await only the financial execution for latency measurement
        try:
            circle_tx_id = await self.rescuer.rescue(
                amount=event.rescue_amount_usdc,
                destination_address=event.account,
                reason_hash=event.reason_hash,
            )
        except Exception as e:
            circle_tx_id = f"FAILED: {e}"

        latency_ms = (time.time() - start_time) * 1000

        # 3. Notification & Persistence (Announced immediately!)
        status = "SUCCESS" if circle_tx_id and "FAILED" not in str(circle_tx_id) else "FAILED"

        await self.publish(
            RescueComplete(
                status=status,
                tx_hash=str(circle_tx_id) or "0xFAILED",
                amount=event.rescue_amount_usdc,
                reason_hash=event.reason_hash,
                latency_ms=latency_ms
            )
        )

        self.logger.info(
            "rescue_cycle_finished",
            status=status,
            rescue_tx=circle_tx_id,
            latency_ms=f"{latency_ms:.2f}ms",
            background_tasks_pending=len(background_tasks)
        )


# Instantiate singleton
dispatcher = RescueDispatcher()
