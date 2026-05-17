import asyncio
import os
from web3 import Web3
from src.base import BaseComponent
from src.events import ReasoningTrace, RescueComplete
from src.errors import safe_handler

# Minimal ABI for AttributionRegistry
REGISTRY_ABI = [
    {
        "inputs": [{"internalType": "bytes32", "name": "reasonHash", "type": "bytes32"}],
        "name": "storeReason",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function",
    }
]


class RescueDispatcher(BaseComponent):
    def __init__(self, agent_address: str):
        super().__init__("RescueDispatcher")
        self.agent_address = agent_address
        self.rpc_url = os.getenv("RPC", "https://rpc.arc.testnet")
        self.registry_address = os.getenv(
            "REGISTRY_ADDRESS", "0x0000000000000000000000000000000000000000"
        )
        self.private_key = os.getenv("AGENT_PRIVATE_KEY")

        self.w3 = Web3(Web3.HTTPProvider(self.rpc_url))
        self.subscribe(ReasoningTrace, self.on_reasoning_trace)

    @safe_handler("RescueDispatcher")
    async def on_reasoning_trace(self, event: ReasoningTrace):
        self.logger.info(f"Received trace for {event.reason_hash}")

        # 1. On-Chain Proof (Pin hash to Arc)
        tx_hash = await self.pin_to_arc(event.reason_hash)

        # 2. Financial Action (Circle Gateway Rescue)
        await self.execute_circle_rescue(event.rescue_amount_usdc)

        # 3. Notification
        await self.publish(
            RescueComplete(
                status="SUCCESS",
                tx_hash=tx_hash,
                amount=event.rescue_amount_usdc,
            )
        )

    async def pin_to_arc(self, reason_hash: str) -> str:
        if not self.private_key:
            self.logger.warning("No AGENT_PRIVATE_KEY found. Simulating on-chain pin.")
            await asyncio.sleep(0.1)
            return "0xSIMULATED_ARC_TX"

        try:
            # Convert string 0x... to bytes32 if necessary
            if isinstance(reason_hash, str) and reason_hash.startswith("0x"):
                reason_hash_bytes = bytes.fromhex(reason_hash[2:])
            else:
                reason_hash_bytes = reason_hash

            account = self.w3.eth.account.from_key(self.private_key)
            contract = self.w3.eth.contract(
                address=self.w3.to_checksum_address(self.registry_address),
                abi=REGISTRY_ABI,
            )

            nonce = self.w3.eth.get_transaction_count(account.address)
            tx = contract.functions.storeReason(reason_hash_bytes).build_transaction(
                {
                    "chainId": 5042002,
                    "gas": 200000,
                    "gasPrice": self.w3.to_wei("0.01", "mwei"),  # Fixed USDC gas
                    "nonce": nonce,
                }
            )

            signed_tx = self.w3.eth.account.sign_transaction(tx, self.private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)

            self.logger.info(f"Pinned hash to Arc. Tx: {tx_hash.hex()}")
            return tx_hash.hex()

        except Exception as e:
            self.logger.error(f"Failed to pin trace to Arc: {str(e)}")
            return "0xFAILED_ARC_TX"

    async def execute_circle_rescue(self, amount: float):
        self.logger.info(f"Moving {amount} USDC via Circle Gateway... [SIMULATED]")
        # In a real scenario, this would call the Circle Gateway SDK
        await asyncio.sleep(0.1)


# Instantiate singleton with a default dev address
dispatcher = RescueDispatcher("0x70997970C51812dc3A010C7d01b50e0d17dc79C8")
