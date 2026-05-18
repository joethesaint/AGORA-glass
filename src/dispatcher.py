import asyncio
import time
from src.base import BaseComponent
from src.events import ReasoningTrace, RescueComplete
from src.errors import safe_handler
from src.services.arc_pinner import ArcPinner
from src.services.circle_rescuer import CircleRescuer


class RescueDispatcher(BaseComponent):
    """Orchestrates rescue operations by coordinating pinning and financial actions.

    Attributes:
        pinner (ArcPinner): Service for pinning traces to the Arc network.
        rescuer (CircleRescuer): Service for executing USDC transfers via Circle.
    """

    def __init__(self):
        """Initializes the dispatcher with services and subscriptions."""
        super().__init__("RescueDispatcher")

        # Load ABIs from standardized contract artifacts if not provided
        self.pinner = ArcPinner()
        self.rescuer = CircleRescuer()
        
        self.subscribe(ReasoningTrace, self.on_reasoning_trace)

    @safe_handler("RescueDispatcher")
    async def on_reasoning_trace(self, event: ReasoningTrace):
        """Processes a reasoning trace to initiate on-chain and financial actions."""
        self.logger.info("rescue_cycle_start", reason_hash=event.reason_hash)

        start_time = time.time()

        # 1. On-Chain Proof (Pin) & Financial Action (Rescue) in parallel
        # Note: ArcPinner and CircleRescuer are independent I/O bound operations.
        arc_task = asyncio.create_task(self.pinner.pin(event.reason_hash))
        circle_task = asyncio.create_task(self.rescuer.rescue(
            amount=event.rescue_amount_usdc,
            destination_address=event.account,
            reason_hash=event.reason_hash,
        ))

        # Wait for both to complete
        arc_tx_hash, circle_tx_id = await asyncio.gather(arc_task, circle_task)

        latency_ms = (time.time() - start_time) * 1000

        # 3. Notification & Persistence
        status = "SUCCESS" if circle_tx_id and "FAILED" not in circle_tx_id else "FAILED"

        await self.publish(
            RescueComplete(
                status=status,
                tx_hash=circle_tx_id or "0xFAILED",
                amount=event.rescue_amount_usdc,
                reason_hash=event.reason_hash,
                latency_ms=latency_ms
            )
        )

        self.logger.info(
            "rescue_cycle_finished",
            status=status,
            pin_tx=arc_tx_hash,
            rescue_tx=circle_tx_id,
            latency_ms=f"{latency_ms:.2f}ms"
        )


# Instantiate singleton
dispatcher = RescueDispatcher()
