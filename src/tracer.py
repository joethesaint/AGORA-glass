import hashlib
import json
import time
from src.base import BaseComponent
from src.events import RiskVerdict, ReasoningTrace

class ReasoningTracer(BaseComponent):
    def __init__(self):
        super().__init__("ReasoningTracer")
        self.subscribe(RiskVerdict, self.on_risk_verdict)

    async def on_risk_verdict(self, event: RiskVerdict):
        if event.status == "CRITICAL":
            trace_event = self.create_trace(event)
            self.logger.info(f"Generated reasoning trace. Hash: {trace_event.reason_hash}")
            await self.publish(trace_event)

    def create_trace(self, event: RiskVerdict) -> ReasoningTrace:
        reasoning_text = (
            f"CRITICAL: Margin ratio {event.margin:.2%} dropped below safety band. "
            f"Symbol: {event.symbol}. Action: Initiating rescue."
        )
        
        reason_hash = hashlib.sha256(reasoning_text.encode()).hexdigest()
        
        return ReasoningTrace(
            agent_id="antigravity_sentinel_v0.1",
            action="RESCUE_INITIATED",
            account="0xMOCK_ACCOUNT",
            leverage_before="25x",
            margin_ratio=event.margin,
            rescue_amount_usdc=500.0,
            evidence=[
                "Margin below 12% threshold",
                "High volatility detected"
            ],
            risk_rating="CRITICAL",
            reason_hash=f"0x{reason_hash}",
            reasoning_text=reasoning_text
        )

# Instantiate singleton
tracer = ReasoningTracer()
