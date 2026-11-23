import asyncio
import logging
import os
from web3 import AsyncWeb3, AsyncHTTPProvider

# ABI for Vault contract (minimal for releaseForRescue)
VAULT_ABI = [
    {
        "inputs": [
            {"internalType": "uint256", "name": "_amount", "type": "uint256"},
            {"internalType": "string", "name": "_destinationChain", "type": "string"},
            {"internalType": "address", "name": "_recipient", "type": "address"},
            {"internalType": "bytes32", "name": "_reasonHash", "type": "bytes32"},
        ],
        "name": "releaseForRescue",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function",
    }
]


class VaultService:
    """Handles interactions with the AGORA Vault contract on the Arc network."""

    def __init__(self):
        """Initializes the vault service with environment variables."""
        self.logger = logging.getLogger("VaultService")
        
        self.rpc_url = os.getenv("RPC", "https://rpc.testnet.arc-node.thecanteenapp.com/v1/swrm_42b1f431a6cfa6a62d2c14e6c91d2c39545bc99bb8ee5c241f85f8108a4af369")
        self.vault_address = os.getenv("VAULT_ADDRESS", "0x0000000000000000000000000000000000000000")
        self.private_key = os.getenv("AGENT_PRIVATE_KEY")
        
        self.w3 = AsyncWeb3(AsyncHTTPProvider(self.rpc_url))
        self.account = None
        self.contract = None
        self._nonce = None

    async def _ensure_initialized(self):
        """Lazy initialization of web3 components."""
        if not self.account and self.private_key:
            self.account = self.w3.eth.account.from_key(self.private_key)
            self.contract = self.w3.eth.contract(
                address=self.w3.to_checksum_address(self.vault_address),
                abi=VAULT_ABI,
            )
            self._nonce = await self.w3.eth.get_transaction_count(self.account.address)

    async def release_funds(self, amount: float, recipient: str, reason_hash: str) -> str:
        """Calls the Vault contract to authorize the release of rescue funds.

        Args:
            amount: The amount of USDC (will be converted to 6 decimals).
            recipient: The recipient address.
            reason_hash: The reasoning trace hash.

        Returns:
            str: The transaction hash on Arc.
        """
        if not self.private_key or os.getenv("LIVE_MODE", "false").lower() != "true":
            self.logger.info(f"MOCK VAULT RELEASE: Authorizing {amount} USDC for {recipient}")
            await asyncio.sleep(0.04)  # Fast-path mock: 40ms (was 150ms)
            return "0xSIMULATED_VAULT_TX"

        if self.vault_address == "0x0000000000000000000000000000000000000000":
            self.logger.error("VAULT_ADDRESS not set.")
            return "0xMISSING_VAULT_ADDR"

        try:
            await self._ensure_initialized()

            # Convert amount to 6 decimals (USDC)
            amount_raw = int(amount * 1_000_000)
            # Standardize hash to bytes32
            hash_bytes = bytes.fromhex(reason_hash[2:]) if reason_hash.startswith("0x") else bytes.fromhex(reason_hash)
            
            # Destination chain (defaulting to Polygon for Circle Gateway)
            dest_chain = os.getenv("CIRCLE_BLOCKCHAIN", "POLY-AMOY")

            # Build transaction
            gas_price = await self.w3.eth.gas_price

            tx = await self.contract.functions.releaseForRescue(
                amount_raw,
                dest_chain,
                self.w3.to_checksum_address(recipient),
                hash_bytes
            ).build_transaction({
                "chainId": 5042002,
                "gas": 300000,
                "gasPrice": gas_price,
                "nonce": self._nonce,
            })

            # Sign and send
            signed_tx = self.w3.eth.account.sign_transaction(tx, self.private_key)
            tx_hash = await self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
            
            # Increment local nonce
            self._nonce += 1

            self.logger.info(f"Successfully authorized rescue in Vault. Tx: {tx_hash.hex()}")
            return tx_hash.hex()

        except Exception as e:
            self.logger.error(f"Failed to call Vault: {type(e).__name__}: {str(e)}")
            if self.account:
                self._nonce = await self.w3.eth.get_transaction_count(self.account.address)
            return f"0xFAILED_VAULT_TX_{type(e).__name__}"
