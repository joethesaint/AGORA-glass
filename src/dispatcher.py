import asyncio
import os
from src.base import BaseComponent
from src.events import ReasoningTrace, RescueComplete
from web3 import Web3
from eth_account import Account

class RescueDispatcher(BaseComponent):
    """
    Executes rescue actions on-chain (Arc) and via Circle Gateway.
    """
    def __init__(self, agent_private_key: str = None, registry_address: str = None):
        super().__init__("RescueDispatcher")
        self.private_key = agent_private_key or os.getenv("AGENT_PRIVATE_KEY")
        self.registry_address = registry_address or os.getenv("REGISTRY_ADDRESS")
        self.rpc_url = os.getenv("RPC")
        
        if self.private_key:
            self.account = Account.from_key(self.private_key)
            self.logger.info(f"Initialized with agent account: {self.account.address}")
        else:
            self.logger.warning("AGENT_PRIVATE_KEY not set. Operating in simulated mode.")
            self.account = None

        self.w3 = Web3(Web3.HTTPProvider(self.rpc_url)) if self.rpc_url else None
        self.subscribe(ReasoningTrace, self.on_reasoning_trace)

    async def on_reasoning_trace(self, event: ReasoningTrace):
        self.logger.info(
            "rescue_initiated",
            amount_usdc=event.rescue_amount_usdc,
            account=event.account,
            reason_hash=event.reason_hash,
        )

        # 1. On-Chain Proof (Glass-Box Pinning)
        tx_hash = await self.pin_to_arc(event.reason_hash)

        # 2. Financial Action (Circle Gateway Rescue)
        await self.execute_circle_rescue(event.rescue_amount_usdc, event.account)

        # 3. Completion Notification
        self.logger.info(
            "rescue_complete",
            amount_usdc=event.rescue_amount_usdc,
            final_tx_hash=tx_hash or "0xSIMULATED_TX",
        )
        await self.publish(
            RescueComplete(
                status="SUCCESS",
                tx_hash=tx_hash or "0xSIMULATED_TX",
                amount=event.rescue_amount_usdc,
            )
        )

    async def pin_to_arc(self, reason_hash: str) -> str:
        """Pins the reasoning hash to the Arc AttributionRegistry."""
        if not self.w3 or not self.account or not self.registry_address:
            self.logger.debug("simulating_arc_pin", reason_hash=reason_hash)
            await asyncio.sleep(0.2)
            return None

        try:
            # ... (ABI and contract setup)
            abi = [
                {
                    "inputs": [{"name": "_hash", "type": "bytes32"}],
                    "name": "storeReason",
                    "outputs": [],
                    "stateMutability": "external",
                    "type": "function",
                }
            ]
            contract = self.w3.eth.contract(address=self.registry_address, abi=abi)

            # Note: reason_hash is a 0x-prefixed hex string from the Tracer
            hash_bytes = bytes.fromhex(reason_hash[2:])

            nonce = self.w3.eth.get_transaction_count(self.account.address)
            # Use 18 decimals for native USDC gas as per docs
            gas_price = self.w3.to_wei("0.01", "mwei")  # Example fixed price

            tx = contract.functions.storeReason(hash_bytes).build_transaction(
                {
                    "from": self.account.address,
                    "nonce": nonce,
                    "gas": 100000,
                    "gasPrice": gas_price,
                    "chainId": 5042002,
                }
            )

            signed_tx = self.w3.eth.account.sign_transaction(
                tx, private_key=self.private_key
            )
            tx_send = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)

            self.logger.info(
                "reasoning_hash_stored", reason_hash=reason_hash, tx_hash=tx_send.hex()
            )
            return tx_send.hex()

        except Exception as e:
            self.logger.error("trace_pinning_failed", error_message=str(e))
            return None

    async def execute_circle_rescue(self, amount: float, recipient: str):
        """Executes the cross-chain rescue via Circle Gateway API."""
        # For PoC, we simulate the API call to Circle Gateway
        await asyncio.sleep(0.3)  # Simulate <500ms latency

# Instantiate singleton
dispatcher = RescueDispatcher()
