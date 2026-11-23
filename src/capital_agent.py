import asyncio
from src.base import BaseComponent
from src.events import PositionUpdate, MarketRegimeUpdate, RescueOptimization
from src.errors import safe_handler

class CapitalAgent(BaseComponent):
    """
    Portfolio Manager role (from TradingAgents spec).
    Optimizes rescue amounts based on total exposure and market regime.
    """

    def __init__(self):
        super().__init__("CapitalAgent")
        self.latest_regime = "RISK_ON"
        self.exposure_per_account = {}
        
        self.subscribe(MarketRegimeUpdate, self.on_regime)
        self.subscribe(PositionUpdate, self.on_position)

    @safe_handler("CapitalAgent")
    async def on_regime(self, event: MarketRegimeUpdate):
        self.latest_regime = event.regime

    @safe_handler("CapitalAgent")
    async def on_position(self, event: PositionUpdate):
        self.exposure_per_account[event.account] = event.leverage * 1000 # Mock exposure
        await self.optimize_capital(event.account)

    async def optimize_capital(self, account: str):
        """Calculates optimized rescue amount based on portfolio health."""
        base_amount = 500.0
        
        # Risk-adjusted scaling
        if self.latest_regime == "EXTREME_VOLATILITY":
            multiplier = 1.5 # Deploy more capital to withstand swings
            rationale = "Scaling up rescue for extreme volatility protection."
        elif self.latest_regime == "RISK_OFF":
            multiplier = 0.8 # Conservative deployment
            rationale = "Risk-off regime: Reducing capital deployment."
        else:
            multiplier = 1.0
            rationale = "Standard capital allocation."

        optimized_amount = base_amount * multiplier

        self.logger.info("capital_optimized", account=account, amount=optimized_amount)
        
        await self.publish(RescueOptimization(
            account=account,
            optimized_amount_usdc=optimized_amount,
            allocation_rationale=rationale
        ))
