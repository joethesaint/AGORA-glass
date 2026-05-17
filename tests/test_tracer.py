import pytest
from src.tracer import ReasoningTracer

def test_tracer_json_structure():
    tracer = ReasoningTracer()
    mock_data = {
        "status": "CRITICAL",
        "margin": 0.09,
        "symbol": "BTC-PERP"
    }
    
    trace = tracer.create_trace(mock_data)
    
    assert "timestamp" in trace
    assert trace["risk_rating"] == "CRITICAL"
    assert trace["reason_hash"].startswith("0x")
    assert len(trace["reason_hash"]) == 66 # 0x + 64 chars
    assert trace["margin_ratio"] == 0.09
