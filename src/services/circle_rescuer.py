import asyncio
import logging
import os
import uuid
from typing import Optional

# Using the modern Circle Developer-Controlled Wallets SDK
try:
    from circle.web3 import utils
    from circle.web3 import developer_controlled_wallets
    SDK_AVAILABLE = True
except ImportError:
    SDK_AVAILABLE = False

class CircleRescuer:
    """Handles high-speed USDC transfers using the Circle Developer-Controlled Wallets SDK.

    Attributes:
        api_key (str): The Circle API key for authentication.
        entity_secret (str): The entity secret for signing transactions.
    """

    def __init__(self):
        """Initializes the rescuer with Circle SDK components."""
        self.logger = logging.getLogger("CircleRescuer")
        
        self.api_key = os.getenv("CIRCLE_API_KEY")
        self.entity_secret = os.getenv("CIRCLE_ENTITY_SECRET")
        self.client = None
        self.transactions_api = None
        
        if SDK_AVAILABLE and self.api_key and self.entity_secret:
            try:
                self.client = utils.init_developer_controlled_wallets_client(
                    api_key=self.api_key,
                    entity_secret=self.entity_secret
                )
                self.transactions_api = developer_controlled_wallets.TransactionsApi(self.client)
                self.logger.info("Circle Developer-Controlled Wallets SDK initialized.")
            except Exception as e:
                self.logger.error(f"Failed to initialize Circle SDK: {e}")
        else:
            if not SDK_AVAILABLE:
                self.logger.warning("Circle DCW SDK not found. Rescuer in mock mode.")
            elif not self.api_key:
                self.logger.warning("CIRCLE_API_KEY not set. Rescuer in mock mode.")
            elif not self.entity_secret:
                self.logger.warning("ENTITY_SECRET not set. Rescuer in mock mode.")

    async def rescue(self, amount: float, destination_address: str, reason_hash: str) -> str:
        """Executes a high-speed USDC transfer to rescue a position.

        Args:
            amount: The amount of USDC to transfer.
            destination_address: The destination address to send the USDC to.
            reason_hash: The cryptographic hash of the reasoning trace (for auditing).

        Returns:
            str: The transaction ID if successful, or a failure placeholder.
        """
        # Always use mock in mock mode or if SDK/Key/Secret missing
        if not self.transactions_api or os.getenv("LIVE_MODE", "false").lower() != "true":
            self.logger.info(f"MOCK RESCUE: Moving {amount} USDC to {destination_address} (Audit Hash: {reason_hash})")

            # Fast-path mock latency: 30-80ms (was 100-400ms).
            # Circle DCW in production targets ~50ms for pre-funded wallets.
            import random
            latency = random.uniform(0.03, 0.08)
            await asyncio.sleep(latency)

            # Check for missing wallet ID even in mock mode if simulation requires it
            if self.api_key and not os.getenv("CIRCLE_WALLET_ID"):
                return "0xMISSING_WALLET_ID"

            return "0xSIMULATED_CIRCLE_TX"

        try:
            self.logger.info(f"Initiating Circle DCW transfer for {amount} USDC to {destination_address}...")
            
            wallet_id = os.getenv("CIRCLE_WALLET_ID")
            blockchain = os.getenv("CIRCLE_BLOCKCHAIN", "ARC-TESTNET") # Default to Arc testnet
            usdc_address = os.getenv("USDC_ADDRESS") # Contract address for USDC on the selected blockchain

            if not wallet_id:
                raise ValueError("CIRCLE_WALLET_ID not configured")

            # Create the transfer request
            # Using the models from the DCW SDK
            request = developer_controlled_wallets.CreateTransactionRequest(
                idempotency_key=str(uuid.uuid4()),
                blockchain=blockchain,
                wallet_id=wallet_id,
                token_address=usdc_address,
                destination_address=destination_address,
                amounts=[str(amount)],
                fee_level="HIGH" # Prioritize speed for rescue
            )
            
            # Note: This SDK call is synchronous. In production, we'd use an executor.
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None, 
                lambda: self.transactions_api.create_transaction(request)
            )
            
            tx_id = response.data.id
            self.logger.info(f"Circle DCW rescue initiated. TX ID: {tx_id}")
            return tx_id

        except Exception as e:
            self.logger.error(f"Circle DCW Rescuer failed: {type(e).__name__}: {str(e)}")
            return f"0xFAILED_CIRCLE_TX_{type(e).__name__}"
