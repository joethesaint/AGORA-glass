import hashlib
import json
import time
from src.bus import bus

class ReasoningTracer:
    def __init__(self):
        bus.subscribe("risk_verdict", self.on_risk_verdict)

    async def on_risk_verdict(self, data):
        if data.get("status") == "CRITICAL":
            trace = self.create_trace(data)
            print(f"📝 Tracer: Generated reasoning trace. Hash: {trace['reason_hash']}")
            await bus.publish("reasoning_trace", trace)

    def create_trace(self, data):
        """
        Creates a structured JSON reasoning trace following the schema in .rules/architecture.md
        """
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
            "leverage_before": "25x",
            "margin_ratio": data['margin'],
            "rescue_amount_usdc": 500,
            "evidence": [
                "Margin below 12% threshold",
                "High volatility detected"
            ],
            "risk_rating": "CRITICAL",
            "reason_hash": f"0x{reason_hash}",
            "reasoning_text": reasoning_text # For storage
        }
        return trace

# Instantiate
tracer = ReasoningTracer()
