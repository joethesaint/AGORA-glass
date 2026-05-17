import asyncio
from src.base import BaseComponent

class PerpMonitor(BaseComponent):
    """
    Monitors perpetual positions on Hyperliquid.
    """
    def __init__(self, mode="mock"):
        super().__init__("PerpMonitor")
        self.mode = mode

    async def run(self):
        self.logger.info(f"Starting monitor (mode: {self.mode})")
        
        if self.mode == "mock":
            sequence = [
                {"symbol": "BTC-PERP", "margin": 0.35, "leverage": 3.0},
                {"symbol": "BTC-PERP", "margin": 0.18, "leverage": 4.5},
                {"symbol": "BTC-PERP", "margin": 0.09, "leverage": 5.2}
            ]
            for data in sequence:
                self.logger.info(f"Position Update -> {data['symbol']} | Margin: {data['margin']:.1%}")
                await self.publish("position_update", data)
                await asyncio.sleep(2)
        else:
            self.logger.warning("Live mode not implemented yet. Fallback to mock.")
            await self.run()
