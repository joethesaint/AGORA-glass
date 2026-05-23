import asyncio
import json
import logging
import os
from pathlib import Path
from web3 import AsyncWeb3, AsyncHTTPProvider

_ABI_PATH = Path(__file__).parent.parent.parent / "contracts" / "AttributionRegistry_abi.json"
REGISTRY_ABI = json.loads(_ABI_PATH.read_text())


class ArcPinner:
    """Handles pinning reasoning hashes to the Arc network using AsyncWeb3."""

    ARC_GAS_DECIMALS = 18
    USDC_TOKEN_DECIMALS = 6

    def __init__(self):
        """Initializes the pinner with environment variables and pre-configured async Web3 components."""
        self.logger = logging.getLogger("ArcPinner")
        
        # Load configuration
        self.rpc_url = os.getenv("RPC", "https://rpc.testnet.arc.network")
        self.registry_address = os.getenv(
            "REGISTRY_ADDRESS", "0x0000000000000000000000000000000000000000"
        )
        self.private_key = os.getenv("AGENT_PRIVATE_KEY")
        
        # Initialize Async Web3
        self.w3 = AsyncWeb3(AsyncHTTPProvider(self.rpc_url))
        
        self.account = None
        self.contract = None
        self._nonce = None

    async def _ensure_initialized(self):
        """Lazy initialization of web3 components to avoid sync-in-init."""
        if not self.account and self.private_key:
            self.account = self.w3.eth.account.from_key(self.private_key)
            self.contract = self.w3.eth.contract(
                address=self.w3.to_checksum_address(self.registry_address),
                abi=REGISTRY_ABI,
            )
            self._nonce = await self.w3.eth.get_transaction_count(self.account.address)

    async def pin(self, reason_hash: str) -> str:
        """Pins a reasoning hash to the Arc blockchain asynchronously."""
        if not self.private_key:
            self.logger.warning("No AGENT_PRIVATE_KEY found. Simulating pin.")
            
            # Realistic mock latency for Arc pinning
            import random
            latency = random.uniform(0.05, 0.2)
            await asyncio.sleep(latency)
            
            return "0xSIMULATED_ARC_TX"

        if self.registry_address == "0x0000000000000000000000000000000000000000":
            self.logger.error("REGISTRY_ADDRESS not set. Cannot pin to Arc.")
            return "0xMISSING_REGISTRY_ADDR"

        try:
            await self._ensure_initialized()

            # Standardize hash to bytes32
            hash_bytes = bytes.fromhex(reason_hash[2:]) if reason_hash.startswith("0x") else bytes.fromhex(reason_hash)

            # Build transaction
            gas_price = await self.w3.eth.gas_price
            
            tx = await self.contract.functions.storeReason(hash_bytes).build_transaction(
                {
                    "chainId": 5042002,
                    "gas": 200000,
                    "gasPrice": gas_price,
                    "nonce": self._nonce,
                }
            )

            # Sign and send
            signed_tx = self.w3.eth.account.sign_transaction(tx, self.private_key)
            tx_hash = await self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
            
            # Increment local nonce
            self._nonce += 1

            self.logger.info(f"Successfully pinned hash to Arc. Tx: {tx_hash.hex()}")
            return tx_hash.hex()

        except Exception as e:
            self.logger.error(f"Failed to pin to Arc: {type(e).__name__}: {str(e)}")
            # Reset nonce if transaction failed
            if self.account:
                self._nonce = await self.w3.eth.get_transaction_count(self.account.address)
            return f"0xFAILED_ARC_TX_{type(e).__name__}"
