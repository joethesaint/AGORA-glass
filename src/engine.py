import asyncio
from src.base import BaseComponent
from src.events import PositionUpdate, RiskVerdict

class RiskEngine(BaseComponent):
    def __init__(self, threshold=0.12):
        super().__init__("RiskEngine")
        self.threshold = threshold
        self.subscribe(PositionUpdate, self.on_position_update)

    async def on_position_update(self, event: PositionUpdate):
        margin = event.margin_ratio
        if margin < self.threshold:
            self.logger.warning(f"CRITICAL: {event.symbol} margin {margin:.2%} below {self.threshold:.2%}!")
            await self.publish(RiskVerdict(
                status="CRITICAL",
                margin=margin,
                symbol=event.symbol,
                risk_rating=5
            ))
        else:
            self.logger.info(f"Position {event.symbol} is safe (Margin: {margin:.2%}).")

# Instantiate singleton
engine = RiskEngine()
