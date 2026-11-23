import os
import secrets
import json
from dotenv import load_dotenv, set_key
from circle.web3 import utils, developer_controlled_wallets

def setup_circle():
    """Automates the setup for Circle Developer-Controlled Wallets.
    
    1. Generates a random 32-byte Entity Secret.
    2. Explains how to register it.
    3. Creates a Wallet Set and your first AGORA-glass rescue wallet.
    """
    load_dotenv()
    
    print("🛡️ AGORA-glass: Circle API Setup Assistant\n")
    
    # 1. Entity Secret Generation
    existing_secret = os.getenv("CIRCLE_ENTITY_SECRET")
    if existing_secret:
        print(f"✅ Existing Entity Secret found: {existing_secret[:6]}...")
        entity_secret = existing_secret
    else:
        entity_secret = secrets.token_hex(32)
        print(f"🆕 Generated New Entity Secret: {entity_secret}")
        print("⚠️ IMPORTANT: Save this secret safely. You must register it in the Circle Console.")
        set_key(".env", "CIRCLE_ENTITY_SECRET", entity_secret)

    # 2. API Key Verification
    api_key = os.getenv("CIRCLE_API_KEY")
    if not api_key:
        print("\n❌ CIRCLE_API_KEY not found in .env")
        print("Please go to https://console.circle.com/ (Sandbox) and create a key.")
        return

    # 3. Client Initialization
    try:
        client = utils.init_developer_controlled_wallets_client(
            api_key=api_key,
            entity_secret=entity_secret
        )
        wallet_sets_api = developer_controlled_wallets.WalletSetsApi(client)
        wallets_api = developer_controlled_wallets.WalletsApi(client)
        
        print("\n🚀 Initializing Circle Wallet Set...")
        
        # Create Wallet Set
        wallet_set_resp = wallet_sets_api.create_wallet_set(
            developer_controlled_wallets.CreateWalletSetRequest.from_dict({
                "name": "AGORA-glass Sentinel Set"
            })
        )
        wallet_set_id = wallet_set_resp.data.wallet_set.actual_instance.id
        print(f"✅ Wallet Set Created: {wallet_set_id}")
        set_key(".env", "CIRCLE_WALLET_SET_ID", wallet_set_id)

        # Create Rescue Wallet on Arc Testnet
        print("🏗️ Creating AGORA-glass Rescue Wallet on Arc Testnet...")
        wallet_resp = wallets_api.create_wallet(
            developer_controlled_wallets.CreateWalletRequest.from_dict({
                "walletSetId": wallet_set_id,
                "blockchains": ["ARC-TESTNET"],
                "count": 1,
                "accountType": "EOA"
            })
        )
        
        wallet = wallet_resp.data.wallets[0]
        wallet_id = wallet.actual_instance.id
        wallet_address = wallet.actual_instance.address
        
        print(f"✅ Rescue Wallet Created!")
        print(f"   - ID: {wallet_id}")
        print(f"   - Address: {wallet_address}")
        
        set_key(".env", "CIRCLE_WALLET_ID", wallet_id)
        set_key(".env", "CIRCLE_WALLET_ADDRESS", wallet_address)

        print("\n🎉 Setup Complete! Your .env has been updated.")
        print(f"Next: Go to https://faucet.circle.com/ and fund {wallet_address} with USDC.")

    except developer_controlled_wallets.ApiException as e:
        print(f"\n❌ Circle API Error: {e.status} - {e.reason}")
        print("Note: If you get 401 Unauthorized, make sure you registered your Entity Secret ciphertext in the Console first.")
    except Exception as e:
        print(f"\n❌ An unexpected error occurred: {e}")

if __name__ == "__main__":
    setup_circle()
