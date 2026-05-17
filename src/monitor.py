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
            while True:
                for m in [0.15, 0.13, 0.09]:
                    self.logger.info(f"TICK: Margin {m:.2%}")
                    await self.publish(
                        PositionUpdate(
                            symbol="BTC-PERP",
                            margin_ratio=m,
                            leverage=5.0,
                            account="0xMOCK_USER",
                        )
                    )
                    await asyncio.sleep(5)
        elif self.mode == "live":
            await self._run_live()
        else:
            self.logger.error(f"Unknown mode: {self.mode}")

    async def _run_live(self):
        self.logger.info("Initializing Hyperliquid API client...")
        # Implementation will go here using hyperliquid-python-sdk
        self.logger.warning("Live mode logic not yet fully implemented.")
        while True:
            await asyncio.sleep(60)


# Monitor is started in main.py
