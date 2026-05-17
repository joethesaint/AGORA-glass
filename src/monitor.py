import asyncio
import os
from src.base import BaseComponent
from src.events import PositionUpdate
from hyperliquid.info import Info
from hyperliquid.utils import constants

from hyperliquid.utils import constants
from hyperliquid.info import Info
from hyperliquid.exchange import Exchange

class PerpMonitor(BaseComponent):
    """
    Monitors perpetual positions on Hyperliquid.
    Uses WebSocket for real-time updates and Info API for polling.
    """
    def __init__(self, mode="mock", account_address: str = None):
        super().__init__("PerpMonitor")
        self.mode = mode
        self.account_address = account_address or os.getenv("MONITOR_ACCOUNT")
        
        if self.mode == "live" and not self.account_address:
            self.logger.error("position_fetch_failure", reason="MONITOR_ACCOUNT_NOT_SET")
            self.mode = "mock"

    async def run(self):
        self.logger.info("monitor_started", mode=self.mode)

        if self.mode == "mock":
            await self._run_mock_loop()
        else:
            await self._run_live_loop()

    async def _run_mock_loop(self):
        """Simulated data sequence for demonstration."""
        sequence = [
            {"symbol": "BTC-PERP", "margin": 0.35, "leverage": 3.0},
            {"symbol": "BTC-PERP", "margin": 0.18, "leverage": 4.5},
            {"symbol": "BTC-PERP", "margin": 0.09, "leverage": 5.2},
        ]
        while True:
            for data in sequence:
                self.logger.info(
                    "position_fetch_success",
                    account="0xMOCK",
                    symbol=data["symbol"],
                    margin_ratio=data["margin"],
                    leverage=data["leverage"],
                )
                await self.publish(
                    PositionUpdate(
                        symbol=data["symbol"],
                        margin_ratio=data["margin"],
                        leverage=data["leverage"],
                        account=self.account_address or "0xMOCK",
                    )
                )
                await asyncio.sleep(5)

    async def _run_live_loop(self):
        """Real-time monitoring via Hyperliquid SDK (Polling + WS)."""
        self.logger.info(
            "position_fetch_start", account=self.account_address, exchange="Hyperliquid"
        )
        # Use Testnet by default for the hackathon
        base_url = constants.TESTNET_API_URL
        info = Info(base_url, skip_ws=True)

        while True:
            try:
                # Polling user state (SDK handles signatures/auth if keys provided)
                user_state = info.user_state(self.account_address)
                positions = user_state.get("assetPositions", [])

                if not positions:
                    self.logger.debug("no_open_positions", account=self.account_address)

                for pos_wrapper in positions:
                    pos = pos_wrapper["position"]
                    symbol = pos["coin"]
                    
                    # Calculate margin ratio
                    # Formula: Margin / Position Value
                    margin_ratio = (
                        float(pos["marginUsed"]) / float(pos["positionValue"])
                        if float(pos["positionValue"]) != 0
                        else 1.0
                    )
                    leverage = float(pos["leverage"])

                    self.logger.info(
                        "position_fetch_success",
                        account=self.account_address,
                        symbol=symbol,
                        margin_ratio=margin_ratio,
                        leverage=leverage,
                    )
                    await self.publish(
                        PositionUpdate(
                            symbol=symbol,
                            margin_ratio=margin_ratio,
                            leverage=leverage,
                            account=self.account_address,
                        )
                    )

                await asyncio.sleep(2)  # High-frequency polling for PoC

            except Exception as e:
                self.logger.error("position_fetch_failure", error_message=str(e))
                await asyncio.sleep(10)

# Entry point for the monitor
if __name__ == "__main__":
    # For testing the module in isolation
    monitor = PerpMonitor(mode="mock")
    asyncio.run(monitor.run())
