import pytest
import json
from src.tracer import ReasoningTracer
from src.events import RiskVerdict, ReasoningTrace
from src.bus import bus

@pytest.mark.asyncio
async def test_tracer_generates_trace_on_critical():
    tracer = ReasoningTracer()
    
    traces = []
    def on_trace(ev): traces.append(ev)
    bus.subscribe(ReasoningTrace, on_trace)
    
    # Publish CRITICAL verdict
    verdict = RiskVerdict(
        status="CRITICAL",
        margin=0.08,
        leverage=12.0,
        symbol="BTC-PERP",
        risk_rating=5,
        account="0xAccount"
    )
    await bus.publish(verdict)
    
    assert len(traces) == 1
    assert traces[0].account == "0xAccount"
    assert traces[0].margin_ratio == 0.08
    assert "0x" in traces[0].reason_hash
    
    # Verify JSON deterministic payload
    payload = json.loads(traces[0].reasoning_text)
    assert payload["account"] == "0xAccount"
    assert payload["risk_rating"] == "CRITICAL"

@pytest.mark.asyncio
async def test_tracer_ignores_safe_verdicts():
    tracer = ReasoningTracer()
    
    traces = []
    def on_trace(ev): traces.append(ev)
    bus.subscribe(ReasoningTrace, on_trace)
    
    # Publish SAFE verdict
    verdict = RiskVerdict(
        status="SAFE",
        margin=0.15,
        leverage=2.0,
        symbol="BTC-PERP",
        risk_rating=0,
        account="0xAccount"
    )
    await bus.publish(verdict)
    
    assert len(traces) == 0
