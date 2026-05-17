import asyncio
import os
import json
from src.base import BaseComponent
from src.events import ReasoningTrace, RescueComplete
from web3 import Web3
from eth_account import Account

class RescueDispatcher(BaseComponent):
    """
    Executes rescue actions on-chain (Arc) and via Circle Gateway.
    """
    def __init__(self, agent_private_key: str = None, registry_address: str = None, vault_address: str = None):
        super().__init__("RescueDispatcher")
        self.private_key = agent_private_key or os.getenv("AGENT_PRIVATE_KEY")
        self.registry_address = registry_address or os.getenv("REGISTRY_ADDRESS")
        self.vault_address = vault_address or os.getenv("VAULT_ADDRESS")
        self.rpc_url = os.getenv("RPC")
        
        # Load ABIs
        self.registry_abi = self._load_abi("contracts/AttributionRegistry_abi.json")
        self.vault_abi = self._load_abi("contracts/Vault_abi.json")

        if self.private_key:
            self.account = Account.from_key(self.private_key)
            self.logger.info(f"Initialized with agent account: {self.account.address}")
        else:
            self.logger.warning("AGENT_PRIVATE_KEY not set. Operating in simulated mode.")
            self.account = None

        self.w3 = Web3(Web3.HTTPProvider(self.rpc_url)) if self.rpc_url else None
        self.subscribe(ReasoningTrace, self.on_reasoning_trace)

    def _load_abi(self, path: str):
        try:
            with open(path, "r") as f:
                return json.load(f)
        except Exception as e:
            self.logger.error(f"Failed to load ABI from {path}: {e}")
            return None

    async def on_reasoning_trace(self, event: ReasoningTrace):
        self.logger.info(
            f"Processing reasoning trace for rescue: {event.reason_hash}"
        )

        # 1. On-Chain Proof (Glass-Box Pinning)
        # We pin the hash to the AttributionRegistry first to ensure transparency
        tx_hash_pin = await self.pin_to_arc(event.reason_hash)

        # 2. Financial Action (Circle Gateway Rescue)
        # We trigger the Vault rescue logic which interacts with Circle Gateway
        tx_hash_rescue = await self.execute_circle_rescue(
            event.rescue_amount_usdc, 
            event.account, 
            event.reason_hash
        )

        # 3. Completion Notification
        success = tx_hash_rescue is not None or not self.account
        
        self.logger.info(
            "rescue_cycle_finished",
            success=success,
            pin_tx=tx_hash_pin or "SIMULATED",
            rescue_tx=tx_hash_rescue or "SIMULATED"
        )
        
        await self.publish(
            RescueComplete(
                status="SUCCESS" if success else "FAILED",
                tx_hash=tx_hash_rescue or "0xSIMULATED_TX",
                amount=event.rescue_amount_usdc,
            )
        )

    async def pin_to_arc(self, reason_hash: str) -> str:
        """Pins the reasoning hash to the Arc AttributionRegistry."""
        if not self.w3 or not self.account or not self.registry_address or not self.registry_abi:
            self.logger.debug("simulating_arc_pin", reason_hash=reason_hash)
            await asyncio.sleep(0.1)
            return None

        try:
            contract = self.w3.eth.contract(address=self.registry_address, abi=self.registry_abi)
            hash_bytes = bytes.fromhex(reason_hash[2:]) if reason_hash.startswith("0x") else bytes.fromhex(reason_hash)

            tx = contract.functions.storeReason(hash_bytes).build_transaction({
                "from": self.account.address,
                "nonce": self.w3.eth.get_transaction_count(self.account.address),
                "gas": 100000,
                "gasPrice": self.w3.eth.gas_price,
                "chainId": 5042002,
            })

            signed_tx = self.w3.eth.account.sign_transaction(tx, self.private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
            
            self.logger.info(f"Reasoning hash pinned to Arc: {tx_hash.hex()}")
            return tx_hash.hex()

        except Exception as e:
            self.logger.error(f"Trace pinning failed: {e}")
            return None

    async def execute_circle_rescue(self, amount: float, recipient: str, reason_hash: str):
        """Executes the cross-chain rescue via the Arc Vault and Circle Gateway."""
        if not self.w3 or not self.account or not self.vault_address or not self.vault_abi:
            self.logger.debug("simulating_circle_rescue", amount=amount, recipient=recipient)
            await asyncio.sleep(0.2)
            return None

        try:
            contract = self.w3.eth.contract(address=self.vault_address, abi=self.vault_abi)
            
            # Convert float USDC to 6-decimal integer
            amount_base = int(amount * 10**6)
            hash_bytes = bytes.fromhex(reason_hash[2:]) if reason_hash.startswith("0x") else bytes.fromhex(reason_hash)

            # Note: For the PoC, we use a fixed destination chain (e.g., 'Hyperliquid')
            # and the recipient address on that chain.
            tx = contract.functions.releaseForRescue(
                amount_base,
                "Hyperliquid",
                Web3.to_checksum_address(recipient),
                hash_bytes
            ).build_transaction({
                "from": self.account.address,
                "nonce": self.w3.eth.get_transaction_count(self.account.address),
                "gas": 200000,
                "gasPrice": self.w3.eth.gas_price,
                "chainId": 5042002,
            })

            signed_tx = self.w3.eth.account.sign_transaction(tx, self.private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
            
            self.logger.info(f"Rescue funds released from Vault: {tx_hash.hex()}")
            return tx_hash.hex()

        except Exception as e:
            self.logger.error(f"Circle rescue execution failed: {e}")
            return None

# Instantiate singleton
dispatcher = RescueDispatcher()

