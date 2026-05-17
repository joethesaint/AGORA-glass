import asyncio
import os
from hyperliquid.utils import constants
from hyperliquid.info import Info
from src.base import BaseComponent
from src.events import PositionUpdate


class PerpMonitor(BaseComponent):
    """Monitors asset positions on the Hyperliquid exchange.

    Supports both 'mock' and 'live' modes.

    Attributes:
        mode (str): The operational mode (mock or live).
        target_address (str): The account address to monitor.
    """

    def __init__(self, mode: str = "mock"):
        """Initializes the monitor with a mode and optional account address.

        Args:
            mode: The operational mode, either 'mock' or 'live'.
        """
        super().__init__("PerpMonitor")
        self.mode = mode
        self.target_address = os.getenv("MONITOR_ACCOUNT")

    async def run(self):
        """Starts the monitoring loop based on the current mode."""
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
        """Internal loop for live monitoring using the Hyperliquid SDK."""
        self.logger.info("Initializing Hyperliquid API client...")
        if not self.target_address:
            self.logger.error("MONITOR_ACCOUNT not set. Cannot run live monitor.")
            return

        # Use testnet by default
        base_url = constants.TESTNET_API_URL
        info = Info(base_url, skip_ws=True)

        self.logger.info(f"Monitoring account: {self.target_address}")

        while True:
            try:
                # Fetch user state
                user_state = info.user_state(self.target_address)
                positions = user_state.get("assetPositions", [])

                for pos in positions:
                    p = pos["position"]
                    symbol = p["coin"]
                    # Calculate margin ratio (simplified for mock/structure)
                    margin_ratio = float(p.get("marginRatio", 0.5))
                    leverage = float(p.get("leverage", 1.0))

                    self.logger.debug(
                        f"Fetched {symbol}: Margin {margin_ratio:.2%}, Leverage {leverage}x"
                    )

                    await self.publish(
                        PositionUpdate(
                            symbol=symbol,
                            margin_ratio=margin_ratio,
                            leverage=leverage,
                            account=self.target_address,
                        )
                    )

                await asyncio.sleep(2)  # Polling interval

            except Exception as e:
                self.logger.error(f"Error in live monitor loop: {str(e)}")
                await asyncio.sleep(10)


# Monitor is started in main.py
