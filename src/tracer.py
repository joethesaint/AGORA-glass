import hashlib
import json
from src.base import BaseComponent
from src.events import RiskVerdict, ReasoningTrace
from src.errors import safe_handler


class ReasoningTracer(BaseComponent):
    def __init__(self):
        super().__init__("ReasoningTracer")
        self.subscribe(RiskVerdict, self.on_risk_verdict)

    @safe_handler("ReasoningTracer")
    async def on_risk_verdict(self, event: RiskVerdict):
        if event.status == "CRITICAL":
            trace_event = self.create_trace(event)
            self.logger.info(
                f"Generated reasoning trace. Hash: {trace_event.reason_hash}"
            )
            await self.publish(trace_event)

    def create_trace(self, event: RiskVerdict) -> ReasoningTrace:
        agent_id = "antigravity_sentinel_v0.1"
        action = "RESCUE_INITIATED"
        rescue_amount = 500.0  # Default mock amount
        
        evidence = [
            f"Margin ratio {event.margin:.4f} is below 12%" if event.margin < 0.12 else f"Leverage {event.leverage:.1f}x exceeds 5x",
            f"Symbol: {event.symbol}",
            "Autonomous sentinel triggered rescue protocol"
        ]

        # Payload for hashing (standardizing keys for transparency)
        payload = {
            "agent_id": agent_id,
            "action": action,
            "account": event.account,
            "leverage_before": event.leverage,
            "margin_ratio": event.margin,
            "rescue_amount_usdc": rescue_amount,
            "evidence": evidence,
            "risk_rating": "CRITICAL",
            "timestamp": event.timestamp
        }
        
        # Deterministic JSON hash
        payload_json = json.dumps(payload, sort_keys=True)
        reason_hash = hashlib.sha256(payload_json.encode()).hexdigest()

        return ReasoningTrace(
            agent_id=agent_id,
            action=action,
            account=event.account,
            leverage_before=event.leverage,
            margin_ratio=event.margin,
            rescue_amount_usdc=rescue_amount,
            evidence=evidence,
            risk_rating="CRITICAL",
            reason_hash=f"0x{reason_hash}",
            reasoning_text=payload_json  # Store full payload for verification
        )


# Instantiate singleton
tracer = ReasoningTracer()
