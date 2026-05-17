import asyncio
import random
from src.base import BaseComponent
from src.events import MarketVolatilityUpdate


class MarketDataMonitor(BaseComponent):
    """
    Monitor for market-wide data, such as volatility.
    In production, this would fetch data from Hyperliquid or an external oracle.
    """

    def __init__(self, mode="mock"):
        super().__init__("MarketDataMonitor")
        self.mode = mode

    async def run(self):
        self.logger.info(f"Starting MarketData monitor (mode: {self.mode})")

        if self.mode == "mock":
            # Mock volatility updates
            symbols = ["BTC-PERP", "ETH-PERP", "SOL-PERP"]
            while True:
                for symbol in symbols:
                    # Random volatility factor between 0.0 and 1.0
                    vol_factor = random.uniform(0.1, 0.8)
                    self.logger.info(f"MARKET: {symbol} Volatility {vol_factor:.2f}")
                    await self.publish(
                        MarketVolatilityUpdate(
                            symbol=symbol,
                            volatility_factor=vol_factor,
                        )
                    )
                await asyncio.sleep(10)
        elif self.mode == "live":
            await self._run_live()
        else:
            self.logger.error(f"Unknown mode: {self.mode}")

    async def _run_live(self):
        self.logger.warning("Live market data monitoring not yet implemented. Falling back to mock.")
        await self.run()


# Component instance
market_monitor = MarketDataMonitor()
