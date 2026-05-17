import pytest
from src.tracer import ReasoningTracer
from src.events import RiskVerdict

def test_tracer_json_structure():
    tracer = ReasoningTracer()
    mock_event = RiskVerdict(
        status="CRITICAL",
        margin=0.09,
        symbol="BTC-PERP",
        risk_rating=5
    )
    
    trace = tracer.create_trace(mock_event)
    
    assert trace.risk_rating == "CRITICAL"
    assert trace.reason_hash.startswith("0x")
    assert len(trace.reason_hash) == 66
    assert trace.margin_ratio == 0.09
