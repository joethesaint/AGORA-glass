import asyncio
import os
from src.base import BaseComponent
from src.events import PositionUpdate
from hyperliquid.info import Info
from hyperliquid.utils import constants

class PerpMonitor(BaseComponent):
    """
    Monitors perpetual positions on Hyperliquid.
    Uses WebSocket for real-time updates and Info API for polling.
    """
    def __init__(self, mode="mock", account_address: str = None):
        super().__init__("PerpMonitor")
        self.mode = mode
        self.account_address = account_address or os.getenv("MONITOR_ACCOUNT")
        self._loop = None
        self._info = None
        self.mock_states = {}
        
        if self.mode == "live" and not self.account_address:
            self.logger.error("position_fetch_failure", reason="MONITOR_ACCOUNT_NOT_SET")
            self.mode = "mock"
            
        from src.events import SimulateCrash
        self.subscribe(SimulateCrash, self.on_simulate_crash)

    async def on_simulate_crash(self, event):
        if self.mode == "mock":
            state = self.mock_states.get(event.symbol)
            if state:
                state["price"] *= (1.0 - event.drop_percentage)
                state["margin"] = max(0.01, state["margin"] - (event.drop_percentage * 2))  # Force margin drop
                state["leverage"] *= (1.0 + event.drop_percentage)  # Force leverage spike
                self.logger.warning("mock_position_crashed", symbol=event.symbol, new_margin=state["margin"])

    async def run(self):
        self.logger.info("monitor_started", mode=self.mode)
        self._loop = asyncio.get_running_loop()

        if self.mode == "mock":
            await self._run_mock_loop()
        else:
            await self._run_live_loop()

    async def _run_mock_loop(self):
        """Dynamic mock position simulation with random fluctuations."""
        import random
        symbols = ["BTC-PERP", "ETH-PERP", "SOL-PERP"]
        
        # Initial states
        if not self.mock_states:
            self.mock_states = {
                sym: {
                    "margin": random.uniform(0.2, 0.4),
                    "leverage": random.uniform(2.0, 4.0),
                    "price": 60000.0 if "BTC" in sym else (3000.0 if "ETH" in sym else 140.0)
                } for sym in symbols
            }

        self.logger.info("mock_positions_running", account="0xMOCK", symbols=symbols)

        while True:
            for symbol in symbols:
                state = self.mock_states[symbol]
                
                # Small random changes
                state["margin"] += random.uniform(-0.02, 0.015) # Tendency to drift down slightly
                state["margin"] = max(0.05, min(0.6, state["margin"]))
                
                state["price"] *= (1 + random.normalvariate(0, 0.001))
                
                # Occasionally spike leverage or drop margin to trigger the engine
                if random.random() < 0.1:
                    state["margin"] -= 0.08
                    state["leverage"] += 0.8

                self.logger.info(
                    "position_fetch_success",
                    account="0xMOCK",
                    symbol=symbol,
                    margin_ratio=round(state["margin"], 4),
                    leverage=round(state["leverage"], 2),
                    current_price=round(state["price"], 2),
                )
                
                await self.publish(
                    PositionUpdate(
                        symbol=symbol,
                        margin_ratio=state["margin"],
                        leverage=state["leverage"],
                        account=self.account_address or "0xMOCK",
                        current_price=state["price"],
                    )
                )
            
            # 4Hz updates — 4x higher resolution than before (was 1.0s)
            # Matches realistic exchange feed cadence for position monitoring.
            await asyncio.sleep(0.25)

    async def _run_live_loop(self):
        """Live position monitoring using high-speed WebSockets and polling."""
        self.logger.info(
            "position_ws_start", account=self.account_address, exchange="Hyperliquid"
        )
        
        # Initialize Info with WebSocket enabled
        self._info = Info(constants.TESTNET_API_URL, skip_ws=False)
        
        # 1. Initial Snapshot
        await self._poll_user_state()
        
        # 2. Subscribe to user-specific events (fills, liquidations, etc.)
        self._info.subscribe({"type": "userEvents", "user": self.account_address}, self._on_ws_msg)
        
        # 3. Hybrid approach: Poll occasionally to ensure state is synchronized
        while True:
            await asyncio.sleep(10)  # Less frequent polling when WS is active
            await self._poll_user_state()

    def _on_ws_msg(self, msg: dict):
        """Threaded callback from Hyperliquid SDK; triggers a state refresh on change."""
        # Any user event (fill, etc.) suggests a potential margin change
        if self._loop:
            asyncio.run_coroutine_threadsafe(self._poll_user_state(), self._loop)

    async def _poll_user_state(self):
        """Fetches and publishes the latest user position state."""
        try:
            # self._info.user_state is a synchronous Hyperliquid SDK call;
            # run it off the event loop (same pattern as circle_rescuer.py's
            # synchronous SDK call) so a slow/hanging HTTP request here can't
            # stall the whole asyncio loop — including dispatch of a CRITICAL
            # risk_verdict racing against it.
            loop = asyncio.get_event_loop()
            user_state = await loop.run_in_executor(
                None, lambda: self._info.user_state(self.account_address)
            )
            positions = user_state.get("assetPositions", [])

            if not positions:
                self.logger.debug("no_open_positions", account=self.account_address)

            for pos_wrapper in positions:
                pos = pos_wrapper["position"]
                symbol = pos["coin"]
                
                # Calculate margin ratio
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
                    margin_ratio=round(margin_ratio, 4),
                    leverage=leverage,
                    current_price=float(pos.get("entryPrice", 0.0)),
                )
                await self.publish(
                    PositionUpdate(
                        symbol=symbol,
                        margin_ratio=margin_ratio,
                        leverage=leverage,
                        account=self.account_address,
                        current_price=float(pos.get("entryPrice", 0.0)),
                    )
                )

        except Exception as e:
            self.logger.error("position_poll_failure", error=str(e))

# Entry point for the monitor
if __name__ == "__main__":
    # For testing the module in isolation
    monitor = PerpMonitor(mode="mock")
    asyncio.run(monitor.run())
