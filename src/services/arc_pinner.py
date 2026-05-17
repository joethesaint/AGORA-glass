import asyncio
import logging
import os
from web3 import Web3

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

    Attributes:
        ARC_GAS_DECIMALS (int): Arc native gas (USDC) uses 18 decimals for gas units.
        USDC_TOKEN_DECIMALS (int): Standard ERC-20 USDC on Arc uses 6 decimals.
        rpc_url (str): The Arc network RPC URL.
        registry_address (str): The Ethereum address of the AttributionRegistry contract.
        private_key (str): The private key used to sign transactions on Arc.
        w3 (Web3): The web3.py instance for interacting with Arc.
    """

    ARC_GAS_DECIMALS = 18
    USDC_TOKEN_DECIMALS = 6

    def __init__(self):
        """Initializes the pinner with environment variables for RPC, registry address, and keys."""
        self.logger = logging.getLogger("ArcPinner")
        
        # Load configuration from environment variables
        self.rpc_url = os.getenv("RPC", "https://rpc.testnet.arc-node.thecanteenapp.com/v1/swrm_42b1f431a6cfa6a62d2c14e6c91d2c39545bc99bb8ee5c241f85f8108a4af369")
        self.registry_address = os.getenv(
            "REGISTRY_ADDRESS", "0x0000000000000000000000000000000000000000"
        )
        self.private_key = os.getenv("AGENT_PRIVATE_KEY")
        self.w3 = Web3(Web3.HTTPProvider(self.rpc_url))

    async def pin(self, reason_hash: str) -> str:
        """Pins a reasoning hash to the Arc blockchain.

        Args:
            reason_hash: The 0x-prefixed hex string of the reasoning hash.

        Returns:
            str: The transaction hash if successful, or a failure placeholder.

        Raises:
            ValueError: If the private key or registry address is missing/invalid.
            Web3Exception: If the on-chain transaction fails.
        """
        if not self.private_key:
            self.logger.warning("No AGENT_PRIVATE_KEY found. Simulating pin.")
            await asyncio.sleep(0.1)
            return "0xSIMULATED_ARC_TX"

        if self.registry_address == "0x0000000000000000000000000000000000000000":
            self.logger.error("REGISTRY_ADDRESS not set. Cannot pin to Arc.")
            return "0xMISSING_REGISTRY_ADDR"

        try:
            # Standardize hash to bytes32
            if isinstance(reason_hash, str) and reason_hash.startswith("0x"):
                hash_bytes = bytes.fromhex(reason_hash[2:])
            else:
                hash_bytes = bytes.fromhex(reason_hash)

            account = self.w3.eth.account.from_key(self.private_key)
            contract = self.w3.eth.contract(
                address=self.w3.to_checksum_address(self.registry_address),
                abi=REGISTRY_ABI,
            )

            # Build transaction
            nonce = self.w3.eth.get_transaction_count(account.address)
            tx = contract.functions.storeReason(hash_bytes).build_transaction(
                {
                    "chainId": 5042002,  # Arc Testnet ChainID
                    "gas": 200000,
                    "gasPrice": self.w3.to_wei("0.01", "mwei"),  # Standard Arc gas price
                    "nonce": nonce,
                }
            )

            # Sign and send
            signed_tx = self.w3.eth.account.sign_transaction(tx, self.private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)

            self.logger.info(f"Successfully pinned hash to Arc. Tx: {tx_hash.hex()}")
            return tx_hash.hex()

        except Exception as e:
            self.logger.error(f"Failed to pin to Arc: {type(e).__name__}: {str(e)}")
            return f"0xFAILED_ARC_TX_{type(e).__name__}"
