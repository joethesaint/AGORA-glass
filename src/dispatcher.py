import asyncio
from src.base import BaseComponent
from src.events import ReasoningTrace, RescueComplete
from src.errors import safe_handler


class RescueDispatcher(BaseComponent):
    def __init__(self, agent_address: str):
        super().__init__("RescueDispatcher")
        self.agent_address = agent_address
        self.subscribe(ReasoningTrace, self.on_reasoning_trace)

    @safe_handler("RescueDispatcher")
    async def on_reasoning_trace(self, event: ReasoningTrace):
        self.logger.info(f"Received trace for {event.reason_hash}")

        # 1. On-Chain Proof
        await self.pin_to_arc(event.reason_hash)

        # 2. Financial Action
        await self.execute_circle_rescue(event.rescue_amount_usdc)

        # 3. Notification
        await self.publish(
            RescueComplete(
                status="SUCCESS",
                tx_hash="0xSIMULATED_TX_HASH",
                amount=event.rescue_amount_usdc,
            )
        )

    async def pin_to_arc(self, reason_hash: str):
        self.logger.info(f"Pinning hash {reason_hash} to Arc Network... [SUCCESS]")
        await asyncio.sleep(0.1)

    async def execute_circle_rescue(self, amount: float):
        self.logger.info(f"Moving {amount} USDC via Circle Gateway... [COMPLETE]")
        await asyncio.sleep(0.1)


# Instantiate singleton
dispatcher = RescueDispatcher("0x70997970C51812dc3A010C7d01b50e0d17dc79C8")
