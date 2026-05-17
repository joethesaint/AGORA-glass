import asyncio
from src.bus import bus

class RiskEngine:
    def __init__(self, threshold=0.12):
        self.threshold = threshold
        bus.subscribe("position_update", self.on_position_update)

    async def on_position_update(self, data):
        margin = data.get("margin", 1.0)
        if margin < self.threshold:
            print(f"⚠️ RiskEngine: Margin {margin:.2%} below {self.threshold:.2%}!")
            await bus.publish("risk_verdict", {
                "status": "CRITICAL",
                "margin": margin,
                "symbol": data.get("symbol")
            })
        else:
            print(f"✅ RiskEngine: Position {data.get('symbol')} is safe.")

# Instantiate to start listening
engine = RiskEngine()
