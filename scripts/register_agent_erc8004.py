import os
import json
import logging
import asyncio
from web3 import AsyncWeb3, AsyncHTTPProvider
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("ERC8004Registration")

load_dotenv()

# ERC-8004 Identity Registry Address on Arc Testnet
IDENTITY_REGISTRY_ADDR = "0x8004A818BFB912233c491871b3d84c89A494BD9e"

# Minimal ABI for IdentityRegistry (ERC-721 + ERC-8004 fields)
IDENTITY_REGISTRY_ABI = [
    {
        "inputs": [
            {"internalType": "address", "name": "owner", "type": "address"},
            {"internalType": "string", "name": "metadataURI", "type": "string"}
        ],
        "name": "registerAgent",
        "outputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
        "stateMutability": "nonpayable",
        "type": "function",
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "internalType": "uint256", "name": "tokenId", "type": "uint256"},
            {"indexed": True, "internalType": "address", "name": "owner", "type": "address"},
            {"indexed": False, "internalType": "string", "name": "metadataURI", "type": "string"}
        ],
        "name": "AgentRegistered",
        "type": "event",
    }
]

async def register_agent():
    rpc_url = os.getenv("RPC", "https://rpc.testnet.arc-node.thecanteenapp.com/v1/swrm_42b1f431a6cfa6a62d2c14e6c91d2c39545bc99bb8ee5c241f85f8108a4af369")
    private_key = os.getenv("AGENT_PRIVATE_KEY")
    
    # Example Metadata URI (In production, this should be an IPFS hash pointing to the Agent Card)
    # We use a default one provided in the Arc tutorials for the hackathon demo
    metadata_uri = "ipfs://bafkreibdi6623n3xpf7ymk62ckb4bo75o3qemwkpfvp5i25j66itxvsoei"

    if not private_key:
        logger.error("AGENT_PRIVATE_KEY not found in .env.")
        return

    w3 = AsyncWeb3(AsyncHTTPProvider(rpc_url))
    account = w3.eth.account.from_key(private_key)
    
    logger.info(f"Initializing registration for Agent Owner: {account.address}")
    
    contract = w3.eth.contract(
        address=w3.to_checksum_address(IDENTITY_REGISTRY_ADDR),
        abi=IDENTITY_REGISTRY_ABI
    )

    try:
        # 1. Build Transaction
        nonce = await w3.eth.get_transaction_count(account.address)
        
        logger.info("Building registerAgent transaction...")
        tx = await contract.functions.registerAgent(
            account.address,
            metadata_uri
        ).build_transaction({
            "chainId": 5042002,
            "gas": 300000,
            "gasPrice": w3.to_wei("0.01", "mwei"),
            "nonce": nonce,
        })

        # 2. Sign and Send
        logger.info("Signing transaction...")
        signed_tx = w3.eth.account.sign_transaction(tx, private_key)
        
        logger.info("Sending transaction to Arc Testnet...")
        tx_hash = await w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        
        logger.info(f"Transaction sent! Hash: {tx_hash.hex()}")
        logger.info("Waiting for confirmation (Arc finality < 1s)...")
        
        receipt = await w3.eth.wait_for_transaction_receipt(tx_hash)
        
        if receipt.status == 1:
            logger.info("✅ SUCCESS: AGORA Sentinel registered as an official AI Agent on Arc!")
            # Extract TokenID from logs if needed
            print(f"\n--- REGISTRATION COMPLETE ---")
            print(f"AGENT_IDENTITY_TOKEN_TX={tx_hash.hex()}")
            print(f"CONTRACT_ADDRESS={IDENTITY_REGISTRY_ADDR}")
            print(f"METADATA_URI={metadata_uri}")
        else:
            logger.error("❌ FAILURE: Transaction reverted on-chain.")

    except Exception as e:
        logger.error(f"Failed to register agent: {e}")

if __name__ == "__main__":
    asyncio.run(register_agent())
