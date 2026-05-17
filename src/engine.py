import asyncio
from src.base import BaseComponent

class RiskEngine(BaseComponent):
    """
    Assesses risk based on margin thresholds.
    """
    def __init__(self, threshold=0.12):
        super().__init__("RiskEngine")
        self.threshold = threshold
        self.subscribe("position_update", self.on_position_update)

    async def on_position_update(self, data):
        margin = data.get("margin", 1.0)
        symbol = data.get("symbol")
        
        if margin < self.threshold:
            self.logger.warning(f"CRITICAL: {symbol} margin {margin:.2%} below {self.threshold:.2%}!")
            await self.publish("risk_verdict", {
                "status": "CRITICAL",
                "margin": margin,
                "symbol": symbol
            })
        else:
            self.logger.info(f"Position {symbol} is safe (Margin: {margin:.2%}).")

# Instantiate singleton
engine = RiskEngine()
