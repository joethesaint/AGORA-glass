import asyncio
import os
from src.base import BaseComponent
from src.events import PositionUpdate
from hyperliquid.info import Info
from hyperliquid.utils import constants

class PerpMonitor(BaseComponent):
    """
    Monitors perpetual positions on Hyperliquid.
    Supports both 'mock' and 'live' modes.
    """
    def __init__(self, mode="mock", account_address: str = None):
        super().__init__("PerpMonitor")
        self.mode = mode
        self.account_address = account_address or os.getenv("MONITOR_ACCOUNT")
        
        if self.mode == "live" and not self.account_address:
            self.logger.error("MONITOR_ACCOUNT not set. Defaulting to mock mode.")
            self.mode = "mock"

    async def run(self):
        self.logger.info(f"Starting monitor (mode: {self.mode})")
        
        if self.mode == "mock":
            await self._run_mock_loop()
        else:
            await self._run_live_loop()

    async def _run_mock_loop(self):
        """Simulated data sequence for demonstration."""
        sequence = [
            {"symbol": "BTC-PERP", "margin": 0.35, "leverage": 3.0},
            {"symbol": "BTC-PERP", "margin": 0.18, "leverage": 4.5},
            {"symbol": "BTC-PERP", "margin": 0.09, "leverage": 5.2}
        ]
        for data in sequence:
            self.logger.info(f"📡 Mock Update -> {data['symbol']} | Margin: {data['margin']:.1%}")
            await self.publish(PositionUpdate(
                symbol=data["symbol"],
                margin_ratio=data["margin"],
                leverage=data["leverage"],
                account=self.account_address or "0xMOCK"
            ))
            await asyncio.sleep(2)

    async def _run_live_loop(self):
        """Real-time monitoring via Hyperliquid API."""
        self.logger.info(f"Connecting to Hyperliquid Testnet for account: {self.account_address}")
        info = Info(constants.TESTNET_API_URL, skip_ws=True)
        
        while True:
            try:
                user_state = info.user_state(self.account_address)
                positions = user_state.get("assetPositions", [])
                
                if not positions:
                    self.logger.info("No open positions found.")
                
                for pos_wrapper in positions:
                    pos = pos_wrapper["position"]
                    symbol = pos["coin"]
                    # Hyperliquid margin ratio calculation
                    # Note: Simplified for PoC. In production, use exact protocol math.
                    margin_ratio = float(pos["marginUsed"]) / float(pos["positionValue"]) if float(pos["positionValue"]) != 0 else 1.0
                    leverage = float(pos["leverage"])
                    
                    self.logger.info(f"📡 Live Update -> {symbol} | Margin: {margin_ratio:.1%}")
                    await self.publish(PositionUpdate(
                        symbol=symbol,
                        margin_ratio=margin_ratio,
                        leverage=leverage,
                        account=self.account_address
                    ))
                
                # Poll every 10 seconds for now (WS integration would be next)
                await asyncio.sleep(10)
                
            except Exception as e:
                self.logger.error(f"Error fetching user state: {e}")
                await asyncio.sleep(5)

# Entry point for the monitor
if __name__ == "__main__":
    # For testing the module in isolation
    monitor = PerpMonitor(mode="mock")
    asyncio.run(monitor.run())
