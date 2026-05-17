from src.base import BaseComponent
from src.events import ReasoningTrace, RescueComplete
from src.errors import safe_handler
from src.services.arc_pinner import ArcPinner
from src.services.circle_rescuer import CircleRescuer


class RescueDispatcher(BaseComponent):
    """Orchestrates rescue operations by coordinating pinning and financial actions.

    Attributes:
        agent_address (str): The address of the agent.
        pinner (ArcPinner): Service for pinning traces to the Arc network.
        rescuer (CircleRescuer): Service for executing USDC transfers via Circle.
    """

    def __init__(self, agent_address: str):
        """Initializes the dispatcher with services and subscriptions.

        Args:
            agent_address: The address of the agent.
        """
        super().__init__("RescueDispatcher")
        self.agent_address = agent_address
        self.pinner = ArcPinner()
        self.rescuer = CircleRescuer()
        self.subscribe(ReasoningTrace, self.on_reasoning_trace)

    @safe_handler("RescueDispatcher")
    async def on_reasoning_trace(self, event: ReasoningTrace):
        """Processes a reasoning trace to initiate on-chain and financial actions.

        Args:
            event: The ReasoningTrace event to process.
        """
        self.logger.info(f"Received trace for {event.reason_hash}")

        # 1. On-Chain Proof (Pin hash to Arc)
        arc_tx_hash = await self.pinner.pin(event.reason_hash)
        self.logger.info(f"Arc Pin Tx: {arc_tx_hash}")

        # 2. Financial Action (Circle Gateway Rescue)
        circle_tx_id = await self.rescuer.rescue(
            amount=event.rescue_amount_usdc,
            destination_address=event.account,
        )

        # 3. Notification
        await self.publish(
            RescueComplete(
                status="SUCCESS" if "FAILED" not in circle_tx_id else "FAILED",
                tx_hash=circle_tx_id,
                amount=event.rescue_amount_usdc,
            )
        )


# Instantiate singleton with a default dev address
dispatcher = RescueDispatcher("0x70997970C51812dc3A010C7d01b50e0d17dc79C8")
