import asyncio
import logging
import os
import uuid
from web3 import Web3
from circle.web3 import utils, developer_controlled_wallets
from src.log_config import get_logger

class CircleRescuer:
    """Handles USDC transfers using the Circle Developer-Controlled Wallets SDK.

    Arc utilizes a "Dual Decimal" system:
    - Native Gas (USDC): 18 decimals.
    - ERC-20 Token (USDC): 6 decimals.

    Attributes:
        USDC_TOKEN_DECIMALS (int): 6 decimals for standard USDC token.
        client: The initialized Circle Wallets client.
        wallets_api: The Wallets API instance.
        transactions_api: The TransactionsApi instance.
        wallet_id (str): The ID of the wallet to send USDC from.
        vault_address (str): The address of the Arc Vault contract.
        vault_abi (dict): The JSON ABI for the Vault contract.
        logger (structlog.BoundLogger): Structured logger instance.
    """

    USDC_TOKEN_DECIMALS = 6

    def __init__(self, vault_address: str = None, vault_abi: dict = None):
        """Initializes the rescuer with Circle API credentials and Vault info.
        
        Args:
            vault_address: The deployed address of the Arc Vault.
            vault_abi: The JSON ABI for the Vault contract.
        """
        self.logger = get_logger("CircleRescuer")
        self.api_key = os.getenv("CIRCLE_API_KEY")
        self.entity_secret = os.getenv("CIRCLE_ENTITY_SECRET")
        self.wallet_id = os.getenv("CIRCLE_WALLET_ID")
        self.vault_address = vault_address or os.getenv("VAULT_ADDRESS")
        self.vault_abi = vault_abi
        self.private_key = os.getenv("AGENT_PRIVATE_KEY")
        self.rpc_url = os.getenv("RPC")
        self.w3 = Web3(Web3.HTTPProvider(self.rpc_url)) if self.rpc_url else None

        if self.api_key and self.entity_secret:
            self.client = utils.init_developer_controlled_wallets_client(
                api_key=self.api_key, entity_secret=self.entity_secret
            )
            self.wallets_api = developer_controlled_wallets.WalletsApi(self.client)
            self.transactions_api = developer_controlled_wallets.TransactionsApi(
                self.client
            )
        else:
            self.client = None
            self.logger.warning("CIRCLE_API_KEY not set. Rescuer in simulated mode.")

    async def rescue(self, amount: float, destination_address: str, reason_hash: str) -> str:
        """Executes a USDC transfer to rescue a position.

        This involves:
        1. Calling 'releaseForRescue' on the Arc Vault (if configured).
        2. Initiating the cross-chain transfer via Circle Gateway SDK.

        Args:
            amount: The amount of USDC to transfer.
            destination_address: The EVM address to send the USDC to.
            reason_hash: The reasoning hash associated with this rescue.

        Returns:
            str: The transaction ID if successful, or a failure placeholder.
        """
        # 1. Arc Vault Release (Optional/Integrated step)
        # If we have a private key and vault, we release funds to the agent address first
        if self.w3 and self.private_key and self.vault_address and self.vault_abi:
            await self._release_from_vault(amount, destination_address, reason_hash)

        # 2. Circle Gateway Transfer
        if not self.client:
            self.logger.info("simulating_circle_rescue", 
                             amount=amount, 
                             recipient=destination_address)
            await asyncio.sleep(0.3)
            return "0xSIMULATED_CIRCLE_TX"

        if not self.wallet_id:
            self.logger.error("rescue_failed", reason="MISSING_WALLET_ID")
            return "0xMISSING_WALLET_ID"

        try:
            idempotency_key = str(uuid.uuid4())
            
            # Explicit 6-decimal math for ERC-20 USDC
            # Circle SDK usually takes strings for amounts, but we ensure precision
            amount_str = f"{amount:.6f}"
            
            self.logger.debug("initiating_circle_transfer", 
                              amount=amount_str, 
                              recipient=destination_address)

            request = developer_controlled_wallets.CreateTransferTransactionForDeveloperRequest.from_dict({
                "idempotencyKey": idempotency_key,
                "walletId": self.wallet_id,
                "amounts": [amount_str],
                "destinationAddress": destination_address,
                "tokenId": os.getenv("USDC_TOKEN_ID", "4f83693e-2501-525d-9781-356393690d56"),
                "feeLevel": "MEDIUM"
            })

            response = self.transactions_api.create_developer_transaction_transfer(request)
            tx_id = response.data.transaction.id
            self.logger.info("rescue_initiated", circle_tx_id=tx_id)
            return tx_id

        except developer_controlled_wallets.ApiException as e:
            self.logger.error("circle_api_error", status=e.status, reason=e.reason)
            return f"0xFAILED_CIRCLE_TX_{e.status}"
        except Exception as e:
            self.logger.error("rescue_failed", error_message=str(e))
            return f"0xFAILED_CIRCLE_TX_{type(e).__name__}"

    async def _release_from_vault(self, amount: float, recipient: str, reason_hash: str):
        """Releases USDC from the Arc Vault to the agent address."""
        try:
            account = self.w3.eth.account.from_key(self.private_key)
            contract = self.w3.eth.contract(
                address=self.w3.to_checksum_address(self.vault_address),
                abi=self.vault_abi
            )
            
            # 6-decimal math for the contract call
            amount_base = int(amount * 10**self.USDC_TOKEN_DECIMALS)
            hash_bytes = bytes.fromhex(reason_hash[2:]) if reason_hash.startswith("0x") else bytes.fromhex(reason_hash)

            self.logger.debug("releasing_from_vault", amount_base=amount_base, recipient=recipient)

            tx = contract.functions.releaseForRescue(
                amount_base,
                "Hyperliquid",
                Web3.to_checksum_address(recipient),
                hash_bytes
            ).build_transaction({
                "from": account.address,
                "nonce": self.w3.eth.get_transaction_count(account.address),
                "gas": 200000,
                "gasPrice": self.w3.eth.gas_price, # 18-decimal gas price
                "chainId": 5042002,
            })

            signed_tx = self.w3.eth.account.sign_transaction(tx, self.private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
            self.logger.info("vault_funds_released", tx_hash=tx_hash.hex())
            
        except Exception as e:
            self.logger.error("vault_release_failed", error_message=str(e))
