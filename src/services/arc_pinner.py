import asyncio
import logging
import os
from web3 import Web3
from src.log_config import get_logger

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


class ArcPinner:
    """Handles pinning reasoning hashes to the Arc network using web3.py.

    Arc utilizes a "Dual Decimal" system:
    - Native Gas (USDC): 18 decimals.
    - ERC-20 Token (USDC): 6 decimals.

    Attributes:
        ARC_GAS_DECIMALS (int): 18 decimals for Arc native gas (USDC).
        USDC_TOKEN_DECIMALS (int): 6 decimals for standard USDC token.
        rpc_url (str): The Arc network RPC URL.
        registry_address (str): The address of the AttributionRegistry contract.
        private_key (str): The agent's private key for signing transactions.
        w3 (Web3): The web3 instance.
        logger (structlog.BoundLogger): Structured logger instance.
    """

    ARC_GAS_DECIMALS = 18
    USDC_TOKEN_DECIMALS = 6

    def __init__(self, registry_address: str = None, registry_abi: dict = None):
        """Initializes the pinner with environment variables and ABIs.
        
        Args:
            registry_address: The deployed address of AttributionRegistry.
            registry_abi: The JSON ABI for AttributionRegistry.
        """
        self.logger = get_logger("ArcPinner")
        self.rpc_url = os.getenv("RPC")
        self.registry_address = registry_address or os.getenv("REGISTRY_ADDRESS")
        self.registry_abi = registry_abi or REGISTRY_ABI
        self.private_key = os.getenv("AGENT_PRIVATE_KEY")
        self.w3 = Web3(Web3.HTTPProvider(self.rpc_url)) if self.rpc_url else None

    async def pin(self, reason_hash: str) -> str:
        """Pins a reasoning hash to the Arc blockchain.

        Args:
            reason_hash: The 0x-prefixed hex string of the reasoning hash.

        Returns:
            str: The transaction hash if successful, or a failure placeholder.
        """
        if not self.w3 or not self.private_key or not self.registry_address:
            self.logger.debug("simulating_arc_pin", reason_hash=reason_hash)
            await asyncio.sleep(0.1)
            return "0xSIMULATED_ARC_TX"

        try:
            # Standardize hash to bytes32
            hash_bytes = bytes.fromhex(reason_hash[2:]) if reason_hash.startswith("0x") else bytes.fromhex(reason_hash)

            account = self.w3.eth.account.from_key(self.private_key)
            contract = self.w3.eth.contract(
                address=self.w3.to_checksum_address(self.registry_address),
                abi=self.registry_abi,
            )

            # Arc deterministic sub-second finality setup
            nonce = self.w3.eth.get_transaction_count(account.address)
            
            # Explicitly handling 18-decimal gas math for Arc
            # 0.01 USDC (Native Gas) = 10^16 units (wei-equivalent)
            gas_price = self.w3.eth.gas_price
            
            self.logger.debug("building_arc_tx", 
                              nonce=nonce, 
                              gas_price_wei=gas_price, 
                              target=self.registry_address)

            tx = contract.functions.storeReason(hash_bytes).build_transaction(
                {
                    "from": account.address,
                    "chainId": 5042002,  # Arc Testnet
                    "gas": 150000,
                    "gasPrice": gas_price,
                    "nonce": nonce,
                }
            )

            # Sign and send
            signed_tx = self.w3.eth.account.sign_transaction(tx, self.private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)

            self.logger.info("reasoning_hash_stored", 
                             reason_hash=reason_hash, 
                             tx_hash=tx_hash.hex())
            return tx_hash.hex()

        except Exception as e:
            self.logger.error("trace_pinning_failed", error_message=str(e))
            return f"0xFAILED_ARC_TX_{type(e).__name__}"
