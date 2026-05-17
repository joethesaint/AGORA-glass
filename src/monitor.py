import asyncio
from src.bus import bus

class PerpMonitor:
    """
    Monitors perpetual positions on Hyperliquid.
    """
    def __init__(self, mode="mock"):
        self.mode = mode

    async def run(self):
        print(f"🔭 Monitor: Starting Hyperliquid monitor (mode: {self.mode})")
        
        if self.mode == "mock":
            # Mock data sequence: SAFE -> WARNING -> CRITICAL
            sequence = [
                {"symbol": "BTC-PERP", "margin": 0.35, "leverage": 3.0},
                {"symbol": "BTC-PERP", "margin": 0.18, "leverage": 4.5},
                {"symbol": "BTC-PERP", "margin": 0.09, "leverage": 5.2}
            ]
            for data in sequence:
                print(f"📡 Monitor: Position Update -> {data['symbol']} | Margin: {data['margin']:.1%}")
                await bus.publish("position_update", data)
                await asyncio.sleep(2)
        else:
            print("⚠️ Monitor: Live mode not implemented yet. Fallback to mock.")
            await self.run()

# The monitor is started manually in main.py
