import hashlib
import json
from src.base import BaseComponent
from src.events import RiskVerdict, ReasoningTrace, MarketRegimeUpdate, RescueOptimization
from src.errors import safe_handler


class ReasoningTracer(BaseComponent):
    """Generates verifiable reasoning traces for critical risk decisions.

    These traces are hashed and eventually pinned to the Arc blockchain.
    """

    def __init__(self):
        """Initializes the tracer and subscribes to events."""
        super().__init__("ReasoningTracer")
        self.latest_regime = "RISK_ON"
        self.latest_optimization = {} # account -> RescueOptimization
        
        self.subscribe(RiskVerdict, self.on_risk_verdict)
        self.subscribe(MarketRegimeUpdate, self.on_regime)
        self.subscribe(RescueOptimization, self.on_optimization)

    @safe_handler("ReasoningTracer")
    async def on_regime(self, event: MarketRegimeUpdate):
        self.latest_regime = event.regime

    @safe_handler("ReasoningTracer")
    async def on_optimization(self, event: RescueOptimization):
        self.latest_optimization[event.account] = event

    @safe_handler("ReasoningTracer")
    async def on_risk_verdict(self, event: RiskVerdict):
        """Processes critical risk verdicts to generate a reasoning trace.

        Args:
            event: The RiskVerdict event to process.
        """
        if event.status == "CRITICAL":
            trace_event = self.create_trace(event)
            self.logger.info(
                "reasoning_trace_generated",
                reason_hash=trace_event.reason_hash,
                risk_rating=trace_event.risk_rating,
                evidence_count=len(trace_event.evidence),
            )
            await self.publish(trace_event)

    def create_trace(self, event: RiskVerdict) -> ReasoningTrace:
        """Creates a deterministic reasoning trace and hash."""
        agent_id = self.agent_id
        action = "RESCUE_INITIATED"
        
        # Pull insights from collaborating agents
        opt = self.latest_optimization.get(event.account)
        rescue_amount = opt.optimized_amount_usdc if opt else 500.0
        allocation_note = opt.allocation_rationale if opt else "Standard rescue amount used."

        evidence = [
            (
                f"Margin ratio {event.margin:.4f} is below 12%"
                if event.margin < 0.12
                else f"Leverage {event.leverage:.1f}x exceeds 5x"
            ),
            f"Market Regime: {self.latest_regime}",
            f"Portfolio Logic: {allocation_note}",
            f"Symbol: {event.symbol}",
            "Autonomous multi-agent consensus triggered rescue protocol",
        ]

        # Payload for hashing
        payload = {
            "agent_id": agent_id,
            "action": action,
            "account": event.account,
            "leverage_before": event.leverage,
            "margin_ratio": event.margin,
            "rescue_amount_usdc": rescue_amount,
            "market_regime": self.latest_regime,
            "allocation_rationale": allocation_note,
            "evidence": evidence,
            "risk_rating": "CRITICAL",
            "timestamp": event.timestamp,
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
            reasoning_text=payload_json,  # Store full payload for verification
        )


# Instantiate singleton
tracer = ReasoningTracer()
