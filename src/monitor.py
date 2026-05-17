import asyncio
from src.base import BaseComponent
from src.events import PositionUpdate


class PerpMonitor(BaseComponent):
    def __init__(self, mode="mock"):
        super().__init__("PerpMonitor")
        self.mode = mode

    async def run(self):
        self.logger.info(f"Starting Hyperliquid monitor (mode: {self.mode})")

        if self.mode == "mock":
            # Mock data sequence
            for m in [0.15, 0.13, 0.09]:
                self.logger.info(f"TICK: Margin {m:.2%}")
                await self.publish(
                    PositionUpdate(symbol="BTC-PERP", margin_ratio=m, leverage=5.0)
                )
                await asyncio.sleep(1)
        else:
            self.logger.warning("Live mode not implemented yet.")


# Monitor is started in main.py
