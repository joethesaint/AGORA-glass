import asyncio
import random
from src.base import BaseComponent
from src.events import MarketVolatilityUpdate, MarketRegimeUpdate
from src.errors import safe_handler

class SentimentAgent(BaseComponent):
    """
    Research Manager role (from TradingAgents spec).
    Monitors market atmosphere and classifies the current regime.
    """

    def __init__(self):
        super().__init__("SentimentAgent")
        self.latest_volatility = 0.5
        self.subscribe(MarketVolatilityUpdate, self.on_volatility)

    @safe_handler("SentimentAgent")
    async def on_volatility(self, event: MarketVolatilityUpdate):
        self.latest_volatility = event.volatility_factor
        await self.evaluate_regime()

    async def evaluate_regime(self):
        """Classifies the market regime using sentiment and volatility."""
        # In a real version, this would fetch social/news sentiment
        # Here we simulate with a jittered walk for the demo
        sentiment = random.uniform(-0.5, 0.5)
        
        if self.latest_volatility > 0.8:
            regime = "EXTREME_VOLATILITY"
        elif sentiment < -0.2:
            regime = "RISK_OFF"
        else:
            regime = "RISK_ON"

        self.logger.info("regime_detected", regime=regime, sentiment=f"{sentiment:.2f}")
        
        await self.publish(MarketRegimeUpdate(
            regime=regime,
            sentiment_score=sentiment
        ))
