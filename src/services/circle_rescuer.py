import asyncio
import logging
import os
import uuid

try:
    from circle.web3 import utils, developer_controlled_wallets
    CIRCLE_SDK_AVAILABLE = True
except ImportError:
    CIRCLE_SDK_AVAILABLE = False
    utils = None
    developer_controlled_wallets = None

class CircleRescuer:
    """Handles USDC transfers using the Circle Developer-Controlled Wallets SDK.

    Attributes:
        USDC_TOKEN_DECIMALS (int): Standard ERC-20 USDC uses 6 decimals.
        api_key (str): The Circle API key for authentication.
        entity_secret (str): The hex-encoded entity secret for Developer-Controlled Wallets.
        wallet_id (str): The specific Circle wallet ID used for rescues.
        client: The initialized Circle Wallets client.
        wallets_api: API instance for wallet management.
        transactions_api: API instance for executing transfers.
    """

    USDC_TOKEN_DECIMALS = 6

    def __init__(self):
        """Initializes the rescuer with Circle API credentials and setup the SDK clients."""
        self.logger = logging.getLogger("CircleRescuer")
        
        # Load credentials from environment
        self.api_key = os.getenv("CIRCLE_API_KEY")
        self.entity_secret = os.getenv("CIRCLE_ENTITY_SECRET")
        self.wallet_id = os.getenv("CIRCLE_WALLET_ID")

        if not CIRCLE_SDK_AVAILABLE:
            self.client = None
            self.logger.warning("Circle SDK not installed. Rescuer in mock mode.")
        elif self.api_key and self.entity_secret:
            self.client = utils.init_developer_controlled_wallets_client(
                api_key=self.api_key,
                entity_secret=self.entity_secret
            )
            self.wallets_api = developer_controlled_wallets.WalletsApi(self.client)
            self.transactions_api = developer_controlled_wallets.TransactionsApi(self.client)
        else:
            self.client = None
            self.logger.warning("CIRCLE_API_KEY or CIRCLE_ENTITY_SECRET not set. Rescuer in mock mode.")

    async def rescue(self, amount: float, destination_address: str) -> str:
        """Executes a USDC transfer to rescue a position.

        Args:
            amount: The amount of USDC to transfer.
            destination_address: The EVM address to send the USDC to.

        Returns:
            str: The transaction ID if successful, or a failure placeholder.
        """
        if not self.client:
            self.logger.info(f"MOCK RESCUE: Moving {amount} USDC to {destination_address}")
            await asyncio.sleep(0.1)
            return "0xSIMULATED_CIRCLE_TX"

        if not self.wallet_id:
            self.logger.error("CIRCLE_WALLET_ID not set. Cannot execute live rescue.")
            return "0xMISSING_WALLET_ID"

        try:
            # Circle SDK uses a structured request object
            # OperationId: createDeveloperTransactionTransfer
            idempotency_key = str(uuid.uuid4())
            
            request = developer_controlled_wallets.CreateTransferTransactionForDeveloperRequest.from_dict({
                "idempotencyKey": idempotency_key,
                "walletId": self.wallet_id,
                "amounts": [str(amount)],
                "destinationAddress": destination_address,
                "tokenId": os.getenv("USDC_TOKEN_ID", "4f83693e-2501-525d-9781-356393690d56"), # Default to Arc USDC if known
                "feeLevel": "MEDIUM"
            })

            response = self.transactions_api.create_developer_transaction_transfer(request)
            
            # Accessing the transaction ID from the response data
            tx_id = response.data.transaction.id
            self.logger.info(f"Circle rescue initiated. Transaction ID: {tx_id}")
            
            return tx_id

        except developer_controlled_wallets.ApiException as e:
            self.logger.error(f"Circle API Error: {e.status} - {e.reason}")
            return f"0xFAILED_CIRCLE_TX_{e.status}"
        except Exception as e:
            self.logger.error(f"Circle Rescuer failed: {type(e).__name__}: {str(e)}")
            return f"0xFAILED_CIRCLE_TX_{type(e).__name__}"
