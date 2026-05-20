import os
import asyncio
from web3 import AsyncWeb3, AsyncHTTPProvider
from dotenv import load_dotenv

load_dotenv()

async def check_readiness():
    rpc_url = os.getenv("RPC")
    private_key = os.getenv("AGENT_PRIVATE_KEY")
    registry_addr = os.getenv("REGISTRY_ADDRESS")
    vault_addr = os.getenv("VAULT_ADDRESS")
    
    print(f"📡 Testing RPC: {rpc_url}")
    w3 = AsyncWeb3(AsyncHTTPProvider(rpc_url))
    
    try:
        is_connected = await w3.is_connected()
        print(f"✅ Connected to Arc Testnet: {is_connected}")
        
        block = await w3.eth.block_number
        print(f"🧱 Current Block: {block}")
        
        if private_key:
            account = w3.eth.account.from_key(private_key)
            print(f"👤 Agent Address: {account.address}")
            
            # Arc uses USDC for gas, so we check USDC balance (native)
            # On some Arc versions, it might be the native balance itself
            balance = await w3.eth.get_balance(account.address)
            print(f"💰 Gas Balance (Native): {w3.from_wei(balance, 'ether')} tokens")
            
            if balance == 0:
                print("⚠️ WARNING: Agent has 0 balance. Needs funding for gas (native USDC).")
        else:
            print("❌ ERROR: AGENT_PRIVATE_KEY not set in .env")

        # Check Contracts
        for name, addr in [("Registry", registry_addr), ("Vault", vault_addr)]:
            if addr and addr != "0x0000000000000000000000000000000000000000":
                code = await w3.eth.get_code(w3.to_checksum_address(addr))
                if code == b'' or code == '0x':
                    print(f"❌ ERROR: {name} contract not found at {addr}")
                else:
                    print(f"✅ {name} contract found at {addr}")
            else:
                print(f"⚠️ {name} address not set or is zero.")

    except Exception as e:
        print(f"❌ FAILED: {str(e)}")

if __name__ == "__main__":
    asyncio.run(check_readiness())
