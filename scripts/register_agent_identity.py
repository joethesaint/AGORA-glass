import os
import json
import logging
from web3 import Web3
from circle.web3 import utils, developer_controlled_wallets
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger("RegisterIdentity")

# ERC-8004 Contract Addresses on Arc Testnet
IDENTITY_REGISTRY = "0x8004A818BFB912233c491871b3d84c89A494BD9e"

# Metadata for AGORA-glass
AGENT_METADATA = {
    "name": "AGORA Glass-Box Sentinel v1.0",
    "description": "Autonomous, ultra-low-latency risk management agent for perpetual futures liquidations.",
    "agent_type": "security_sentinel",
    "capabilities": [
        "liquidation_protection",
        "margin_monitoring",
        "verifiable_reasoning",
        "high_speed_rescue"
    ],
    "version": "1.0.0",
    "links": {
        "website": "https://agora.finance",
        "github": "https://github.com/joethesaint/AGORA-glass"
    }
}

# Example IPFS URI (would be uploaded in production)
METADATA_URI = "ipfs://bafkreibdi6623n3xpf7ymk62ckb4bo75o3qemwkpfvp5i25j66itxvsoei"

def register_identity():
    load_dotenv()
    
    api_key = os.getenv("CIRCLE_API_KEY")
    entity_secret = os.getenv("ENTITY_SECRET")
    agent_address = os.getenv("AGENT_ADDRESS") # The wallet address of the agent
    
    if not all([api_key, entity_secret, agent_address]):
        logger.error("Missing required environment variables (CIRCLE_API_KEY, ENTITY_SECRET, AGENT_ADDRESS)")
        return

    try:
        # Initialize Circle Client
        client = utils.init_developer_controlled_wallets_client(
            api_key=api_key,
            entity_secret=entity_secret
        )
        
        transactions_api = developer_controlled_wallets.TransactionsApi(client)
        
        logger.info(f"Registering identity for agent {agent_address} on Arc Testnet...")
        
        # Prepare the contract execution request
        # Function: register(string metadataURI)
        request = developer_controlled_wallets.CreateContractExecutionTransactionForDeveloperRequest.from_dict({
            "walletAddress": agent_address,
            "blockchain": "ARC-TESTNET",
            "contractAddress": IDENTITY_REGISTRY,
            "abiFunctionSignature": "register(string)",
            "abiParameters": [METADATA_URI],
            "feeLevel": "MEDIUM"
        })
        
        response = transactions_api.create_developer_transaction_contract_execution(request)
        tx_id = response.data.id
        
        logger.info(f"Identity registration transaction initiated. Tx ID: {tx_id}")
        logger.info("The agent is now being officially recognized in the Arc Agentic Economy.")
        logger.info(f"Check status: https://testnet.arcscan.app/address/{agent_address}")

    except Exception as e:
        logger.error(f"Failed to register identity: {e}")

if __name__ == "__main__":
    register_identity()
