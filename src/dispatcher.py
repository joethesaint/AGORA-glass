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

    def __init__(self, registry_abi: dict = None, vault_abi: dict = None):
        """Initializes the dispatcher with services and subscriptions.

        Args:
            registry_abi: Optional JSON ABI for the registry.
            vault_abi: Optional JSON ABI for the vault.
        """
        super().__init__("RescueDispatcher")

        # Load ABIs from standardized contract artifacts if not provided
        self.registry_abi = registry_abi or self._load_abi(
            "contracts/AttributionRegistry_abi.json"
        )
        self.vault_abi = vault_abi or self._load_abi("contracts/Vault_abi.json")

        self.pinner = ArcPinner(registry_abi=self.registry_abi)
        self.rescuer = CircleRescuer(vault_abi=self.vault_abi)

        self.subscribe(ReasoningTrace, self.on_reasoning_trace)

    def _load_abi(self, path: str):
        """Helper to load JSON ABIs."""
        try:
            import json

            with open(path, "r") as f:
                return json.load(f)
        except Exception as e:
            self.logger.error("abi_load_failed", path=path, error=str(e))
            return None

    @safe_handler("RescueDispatcher")
    async def on_reasoning_trace(self, event: ReasoningTrace):
        """Processes a reasoning trace to initiate on-chain and financial actions.

        This represents the 'Track A' transition to live Arc Testnet.
        """
        self.logger.info("rescue_cycle_start", reason_hash=event.reason_hash)

        # 1. On-Chain Proof (Pin hash to Arc)
        # Note: ArcPinner handles the 18-decimal gas math internally.
        arc_tx_hash = await self.pinner.pin(event.reason_hash)

        # 2. Financial Action (Circle Gateway Rescue)
        # Note: CircleRescuer handles the 6-decimal token math and Vault release.
        circle_tx_id = await self.rescuer.rescue(
            amount=event.rescue_amount_usdc,
            destination_address=event.account,
            reason_hash=event.reason_hash,
        )

        # 3. Notification & Persistence
        status = "SUCCESS" if "FAILED" not in circle_tx_id else "FAILED"

        await self.publish(
            RescueComplete(
                status=status,
                tx_hash=circle_tx_id,
                amount=event.rescue_amount_usdc,
            )
        )

        self.logger.info(
            "rescue_cycle_finished",
            status=status,
            pin_tx=arc_tx_hash,
            rescue_tx=circle_tx_id,
        )


# Instantiate singleton
dispatcher = RescueDispatcher()
