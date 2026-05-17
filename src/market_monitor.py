import asyncio
import polars as pl
from src.base import BaseComponent
from src.events import MarketVolatilityUpdate
from hyperliquid.info import Info
from hyperliquid.utils import constants


class MarketDataMonitor(BaseComponent):
    """
    Monitor for live market data using Polars for high-performance volatility calculations.
    Calculates realized volatility across multiple symbols simultaneously using 
    vectorized rolling window operations.
    """

    def __init__(self, mode="mock", window_size=30):
        super().__init__("MarketDataMonitor")
        self.mode = mode
        self.window_size = window_size
        # Store price history as a single Polars DataFrame
        # Schema: ["timestamp", "symbol", "price"]
        self.history_df = pl.DataFrame(schema={
            "timestamp": pl.Float64,
            "symbol": pl.Utf8,
            "price": pl.Float64
        })
        self._info = Info(constants.TESTNET_API_URL, skip_ws=True)

    async def run(self):
        self.logger.info("market_monitor_started", mode=self.mode, engine="Polars")

        if self.mode == "mock":
            await self._run_mock()
        else:
            await self._run_live()

    async def _run_mock(self):
        """Mock volatility updates for testing."""
        symbols = ["BTC-PERP", "ETH-PERP"]
        import random
        import time

        while True:
            for symbol in symbols:
                vol_factor = random.uniform(0.1, 0.5)
                await self.publish(
                    MarketVolatilityUpdate(
                        symbol=symbol,
                        volatility_factor=vol_factor,
                    )
                )
            await asyncio.sleep(10)

    async def _run_live(self):
        """Live volatility monitoring loop using Polars vectorized logic."""
        self.logger.info("live_volatility_tracking_start", window_size=self.window_size)
        
        while True:
            try:
                import time
                current_time = time.time()
                mids = self._info.all_mids()
                
                # 1. Ingest all prices into a temporary DataFrame
                new_data = []
                for symbol, price in mids.items():
                    # Focus on PERP assets
                    if symbol.endswith("-PERP") or symbol in ["BTC", "ETH", "SOL"]:
                        symbol_name = f"{symbol}-PERP" if not symbol.endswith("-PERP") else symbol
                        new_data.append({
                            "timestamp": current_time,
                            "symbol": symbol_name,
                            "price": float(price)
                        })
                
                if not new_data:
                    continue

                # 2. Append to history and prune old data
                batch_df = pl.DataFrame(new_data)
                self.history_df = pl.concat([self.history_df, batch_df])
                
                # Keep only recent history to bound memory (roughly window_size * assets)
                # Pruning logic: keep last N samples per symbol
                self.history_df = (
                    self.history_df
                    .sort(["symbol", "timestamp"])
                    .group_by("symbol")
                    .tail(self.window_size)
                )

                # 3. Vectorized Volatility Calculation
                # Strategy: Calculate log returns and standard deviation per group
                if self.history_df.group_by("symbol").count().get_column("count").min() >= 5:
                    vol_results = (
                        self.history_df
                        .sort(["symbol", "timestamp"])
                        .group_by("symbol")
                        .agg([
                            pl.col("price").log().diff().std().alias("std_dev"),
                            pl.col("price").last().alias("last_price")
                        ])
                        .filter(pl.col("std_dev").is_not_null())
                    )

                    # 4. Publish Updates
                    for row in vol_results.to_dicts():
                        # Normalize std_dev (roughly 100x scaling for 2s log returns)
                        vol_factor = float(np.clip(row["std_dev"] * 100, 0.0, 1.0))
                        
                        await self.publish(
                            MarketVolatilityUpdate(
                                symbol=row["symbol"],
                                volatility_factor=vol_factor,
                            )
                        )
                        self.logger.debug(
                            "volatility_computed",
                            symbol=row["symbol"],
                            vol_factor=vol_factor,
                            price=row["last_price"]
                        )

                # Polling frequency
                await asyncio.sleep(2)
                
            except Exception as e:
                self.logger.error("volatility_engine_failure", error=str(e))
                await asyncio.sleep(5)

# Use numpy for the clip function in the logic above
import numpy as np

# Component instance
market_monitor = MarketDataMonitor()
