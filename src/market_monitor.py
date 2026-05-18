import asyncio
import numpy as np
from collections import deque
from src.base import BaseComponent
from src.events import MarketVolatilityUpdate
from hyperliquid.info import Info
from hyperliquid.utils import constants


class MarketDataMonitor(BaseComponent):
    """
    Monitor for live market data, specifically mid-price volatility.
    Calculates realized volatility using a rolling window of mid-prices
    fetched from the Hyperliquid API.
    """

    def __init__(self, mode="mock", window_size=30):
        """
        Initializes the monitor.
        :param mode: "mock" or "live"
        :param window_size: Number of observations to use for volatility calculation.
        """
        super().__init__("MarketDataMonitor")
        self.mode = mode
        self.window_size = window_size
        # Store price history per symbol: Symbol -> Deque[mid_price]
        self.price_history = {}
        self._info = Info(constants.TESTNET_API_URL, skip_ws=True)

    async def run(self):
        self.logger.info("market_monitor_started", mode=self.mode)

        if self.mode == "mock":
            await self._run_mock()
        else:
            await self._run_live()

    async def _run_mock(self):
        """Realistic mock volatility and price updates using random walks."""
        symbols = ["BTC-PERP", "ETH-PERP", "SOL-PERP", "ARB-PERP", "TIA-PERP"]
        # Initial prices
        prices = {
            "BTC-PERP": 65000.0,
            "ETH-PERP": 3500.0,
            "SOL-PERP": 150.0,
            "ARB-PERP": 1.10,
            "TIA-PERP": 10.50,
        }
        import random

        self.logger.info("mock_market_running", symbols=symbols)

        while True:
            for symbol in symbols:
                # Random walk for price
                change_pct = random.normalvariate(0, 0.002)  # 0.2% std dev
                prices[symbol] *= (1 + change_pct)
                
                # Dynamic volatility factor (0.1 to 0.8)
                # Volatility itself follows a bit of a trend/random walk
                base_vol = self.price_history.get(f"{symbol}_vol", 0.3)
                vol_change = random.uniform(-0.05, 0.05)
                vol_factor = max(0.05, min(0.95, base_vol + vol_change))
                self.price_history[f"{symbol}_vol"] = vol_factor

                self.logger.debug(
                    "mock_market_update", 
                    symbol=symbol, 
                    price=round(prices[symbol], 4), 
                    vol=round(vol_factor, 4)
                )
                
                await self.publish(
                    MarketVolatilityUpdate(
                        symbol=symbol,
                        volatility_factor=vol_factor,
                    )
                )
            
            # Update much faster for realism (every 500ms)
            await asyncio.sleep(0.5)

    async def _run_live(self):
        """Live volatility monitoring loop."""
        self.logger.info("live_volatility_tracking_start")
        
        while True:
            try:
                # Fetch all mid prices
                mids = self._info.all_mids()
                
                # We only care about major assets for now
                target_assets = ["BTC", "ETH", "SOL"]
                
                for asset in target_assets:
                    mid_price = float(mids.get(asset, 0))
                    if mid_price == 0:
                        continue
                    
                    symbol = f"{asset}-PERP"
                    if symbol not in self.price_history:
                        self.price_history[symbol] = deque(maxlen=self.window_size)
                    
                    self.price_history[symbol].append(mid_price)
                    
                    if len(self.price_history[symbol]) >= 5:
                        vol_factor = self._calculate_volatility_factor(symbol)
                        self.logger.info(
                            "live_volatility_update", 
                            symbol=symbol, 
                            vol_factor=vol_factor,
                            price=mid_price
                        )
                        await self.publish(
                            MarketVolatilityUpdate(
                                symbol=symbol,
                                volatility_factor=vol_factor,
                            )
                        )

                # Poll every 2 seconds for granular volatility
                await asyncio.sleep(2)
                
            except Exception as e:
                self.logger.error("volatility_fetch_failure", error=str(e))
                await asyncio.sleep(5)

    def _calculate_volatility_factor(self, symbol: str) -> float:
        """
        Calculates a normalized volatility factor (0.0 to 1.0)
        based on the standard deviation of logarithmic returns.
        """
        prices = list(self.price_history[symbol])
        # Calculate log returns
        returns = np.diff(np.log(prices))
        # Standard deviation of returns
        std_dev = np.std(returns)
        
        # Normalize to 0.0 - 1.0 range
        # Typical crypto 2-second log return std dev ranges from 0.0001 to 0.01
        # We'll use a conservative scaling
        normalized_vol = np.clip(std_dev * 100, 0.0, 1.0)
        return float(normalized_vol)


# Component instance
market_monitor = MarketDataMonitor()
