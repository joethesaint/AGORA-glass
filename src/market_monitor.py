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
        self._info = None
        self._loop = None
        
        self.mock_prices = {
            "BTC-PERP": 65000.0,
            "ETH-PERP": 3500.0,
            "SOL-PERP": 150.0,
            "ARB-PERP": 1.10,
            "TIA-PERP": 10.50,
        }
        
        from src.events import SimulateCrash
        self.subscribe(SimulateCrash, self.on_simulate_crash)

    async def on_simulate_crash(self, event):
        if self.mode == "mock":
            if event.symbol in self.mock_prices:
                self.mock_prices[event.symbol] *= (1.0 - event.drop_percentage)
                self.logger.warning("flash_crash_executed", symbol=event.symbol, new_price=self.mock_prices[event.symbol])

    async def run(self):
        self.logger.info("market_monitor_started", mode=self.mode)
        self._loop = asyncio.get_running_loop()

        if self.mode == "mock":
            await self._run_mock()
        else:
            await self._run_live()

    async def _run_mock(self):
        """Realistic mock volatility and price updates using random walks."""
        symbols = ["BTC-PERP", "ETH-PERP", "SOL-PERP", "ARB-PERP", "TIA-PERP"]
        import random

        self.logger.info("mock_market_running", symbols=symbols)

        while True:
            for symbol in symbols:
                # Random walk for price
                change_pct = random.normalvariate(0, 0.002)  # 0.2% std dev
                self.mock_prices[symbol] *= (1 + change_pct)

                
                # Dynamic volatility factor (0.1 to 0.8)
                # Volatility itself follows a bit of a trend/random walk
                base_vol = self.price_history.get(f"{symbol}_vol", 0.3)
                vol_change = random.uniform(-0.05, 0.05)
                vol_factor = max(0.05, min(0.95, base_vol + vol_change))
                self.price_history[f"{symbol}_vol"] = vol_factor

                self.logger.debug(
                    "mock_market_update", 
                    symbol=symbol, 
                    price=round(self.mock_prices[symbol], 4), 
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
        """Live volatility monitoring using high-speed WebSockets."""
        self.logger.info("live_volatility_ws_start")
        
        # Initialize Info with WebSocket enabled
        self._info = Info(constants.TESTNET_API_URL, skip_ws=False)
        
        # Subscribe to real-time mid prices
        self._info.subscribe({"type": "allMids"}, self._on_ws_msg)
        
        # Keep the task alive
        while True:
            await asyncio.sleep(1)

    def _on_ws_msg(self, msg: dict):
        """
        Threaded callback from Hyperliquid SDK.
        Bridges back to the asyncio event loop.
        """
        if msg.get("channel") != "allMids":
            return
            
        data = msg.get("data", {})
        mids = data.get("mids", {})
        
        target_assets = ["BTC", "ETH", "SOL"]
        for asset in target_assets:
            mid_price = float(mids.get(asset, 0))
            if mid_price == 0:
                continue
                
            symbol = f"{asset}-PERP"
            
            # Use thread-safe bridge to update state and publish events
            asyncio.run_coroutine_threadsafe(
                self._process_mid_price(symbol, mid_price), 
                self._loop
            )

    async def _process_mid_price(self, symbol: str, mid_price: float):
        """Processes a single price update in the main event loop."""
        if symbol not in self.price_history:
            self.price_history[symbol] = deque(maxlen=self.window_size)
        
        self.price_history[symbol].append(mid_price)
        
        if len(self.price_history[symbol]) >= 5:
            vol_factor = self._calculate_volatility_factor(symbol)
            self.logger.debug(
                "live_volatility_update", 
                symbol=symbol, 
                vol_factor=round(vol_factor, 4),
                price=mid_price
            )
            await self.publish(
                MarketVolatilityUpdate(
                    symbol=symbol,
                    volatility_factor=vol_factor,
                )
            )

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
