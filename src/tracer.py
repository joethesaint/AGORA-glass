import hashlib
import json
import time
from src.base import BaseComponent

class ReasoningTracer(BaseComponent):
    """
    Generates cryptographically hashed reasoning traces for transparency.
    """
    def __init__(self):
        super().__init__("ReasoningTracer")
        self.subscribe("risk_verdict", self.on_risk_verdict)

    async def on_risk_verdict(self, data):
        if data.get("status") == "CRITICAL":
            trace = self.create_trace(data)
            self.logger.info(f"Generated reasoning trace. Hash: {trace['reason_hash']}")
            await self.publish("reasoning_trace", trace)

    def create_trace(self, data: dict) -> dict:
        reasoning_text = (
            f"CRITICAL: Margin ratio {data['margin']:.2%} dropped below safety band. "
            f"Symbol: {data['symbol']}. Action: Initiating rescue."
        )
        
        reason_hash = hashlib.sha256(reasoning_text.encode()).hexdigest()
        
        trace = {
            "timestamp": time.time(),
            "agent_id": "antigravity_sentinel_v0.1",
            "action": "RESCUE_INITIATED",
            "account": "0xMOCK_ACCOUNT",
            "leverage_before": "5.2x",
            "margin_ratio": data['margin'],
            "rescue_amount_usdc": 500,
            "evidence": [
                "Margin below 12% threshold",
                "Self-audit violation: leverage > 5x"
            ],
            "risk_rating": "CRITICAL",
            "reason_hash": f"0x{reason_hash}"
        }
        return trace

# Instantiate singleton
tracer = ReasoningTracer()
