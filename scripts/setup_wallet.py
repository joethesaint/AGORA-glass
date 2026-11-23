import os
import json
import logging
from dotenv import load_dotenv
from circle.web3 import utils, developer_controlled_wallets

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("SetupWallet")

load_dotenv()

def setup_wallet():
    api_key = os.getenv("CIRCLE_API_KEY")
    entity_secret = os.getenv("CIRCLE_ENTITY_SECRET")

    if not api_key or not entity_secret:
        logger.error("CIRCLE_API_KEY or CIRCLE_ENTITY_SECRET not found in .env.")
        logger.info("Please set these in your .env file before running this script.")
        return

    # Initialize SDK
    logger.info("Initializing Circle SDK...")
    try:
        client = utils.init_developer_controlled_wallets_client(
            api_key=api_key,
            entity_secret=entity_secret
        )
        
        wallet_sets_api = developer_controlled_wallets.WalletSetsApi(client)
        wallets_api = developer_controlled_wallets.WalletsApi(client)

        logger.info("Creating Wallet Set...")
        wallet_set = wallet_sets_api.create_wallet_set(
            developer_controlled_wallets.CreateWalletSetRequest.from_dict({
                "name": "Agora-Sentinel-Set"
            })
        )
        wallet_set_id = wallet_set.data.wallet_set.id
        logger.info(f"Wallet Set created: {wallet_set_id}")

        logger.info("Creating Wallet on ARC-TESTNET...")
        wallet = wallets_api.create_wallet(
            developer_controlled_wallets.CreateWalletRequest.from_dict({
                "walletSetId": wallet_set_id,
                "blockchains": ["ARC-TESTNET"],
                "count": 1,
                "accountType": "EOA"
            })
        )
        wallet_id = wallet.data.wallets[0].id
        logger.info(f"Wallet created: {wallet_id}")

        print("--- SETUP COMPLETE ---")
        print(f"WALLET_ID={wallet_id}")
        print("Add this WALLET_ID to your .env file.")

    except developer_controlled_wallets.ApiException as e:
        logger.error(f"Circle API Error: {e}")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")

if __name__ == "__main__":
    setup_wallet()
