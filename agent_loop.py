import asyncio
import hashlib
import json
import time
from datetime import datetime

# --- CONFIGURATION & MOCK STATE ---
SAFE_MARGIN_THRESHOLD = 0.12  # 12%
RESCUE_AMOUNT = 500  # USDC
AGENT_ADDRESS = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"

class AGORASentinel:
    def __init__(self):
        self.is_running = True
        print(f"🛡️ AGORA-glass Sentinel Initialized [Agent: {AGENT_ADDRESS}]")

    async def monitor_position(self):
        """
        INPUT: Simulates fetching live data from a Perp Exchange (e.g., Hyperliquid)
        """
        # Mocking a position that starts safe and slowly degrades
        margin_ratios = [0.15, 0.14, 0.13, 0.11, 0.105] 
        for ratio in margin_ratios:
            yield {
                "symbol": "BTC-PERP",
                "margin_ratio": ratio,
                "leverage": "25x",
                "timestamp": time.time()
            }
            await asyncio.sleep(2) # Wait 2s between 'ticks'

    def generate_reasoning(self, position):
        """
        FUNCTION: The 'Glass-Box' logic. Assesses risk and creates a verifiable trace.
        """
        ratio = position['margin_ratio']
        reasoning_text = (
            f"CRITICAL: Margin ratio {ratio:.2%} dropped below safety band {SAFE_MARGIN_THRESHOLD:.2%}. "
            f"Symbol: {position['symbol']} @ {position['leverage']} leverage. "
            f"Action: Initiating {RESCUE_AMOUNT} USDC collateral rescue."
        )
        
        # Create cryptographic hash of the reasoning
        reason_hash = hashlib.sha256(reasoning_text.encode()).hexdigest()
        
        return {
            "text": reasoning_text,
            "hash": f"0x{reason_hash}"
        }

    async def execute_rescue(self, reasoning):
        """
        OUTPUT: Executes the rescue and pins the reason on-chain.
        """
        print(f"\n🚀 [ACTION] Margin Violation Detected!")
        print(f"📝 Reasoning: {reasoning['text']}")
        print(f"🔗 On-Chain Proof (Hash): {reasoning['hash']}")
        
        # Simulate Ayo's contract call
        print(f"📡 Calling AttributionRegistry.sol -> storeReason('{reasoning['hash']}') ... [SUCCESS]")
        
        # Simulate Circle Gateway rescue
        print(f"💸 Circle Gateway: Moving {RESCUE_AMOUNT} USDC to Vault ... [COMPLETE]")
        print(f"⏱️ Rescue Latency: 482ms\n")

    async def run_loop(self):
        """
        The main async orchestration loop.
        """
        print("🔄 Sentinel Loop Started. Monitoring Hyperliquid Testnet...")
        
        async for position in self.monitor_position():
            print(f"Tick: {position['symbol']} | Margin: {position['margin_ratio']:.2%}")
            
            if position['margin_ratio'] < SAFE_MARGIN_THRESHOLD:
                # 1. Evaluate logic & generate trace
                reasoning = self.generate_reasoning(position)
                
                # 2. Execute the rescue (Output)
                await self.execute_rescue(reasoning)
                
                # Break after one rescue for this simulation
                self.is_running = False
                break

if __name__ == "__main__":
    sentinel = AGORASentinel()
    try:
        asyncio.run(sentinel.run_loop())
    except KeyboardInterrupt:
        pass
    print("🛑 Sentinel Stopped.")
