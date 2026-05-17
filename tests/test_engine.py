import pytest
import asyncio
from src.engine import RiskEngine
from src.bus import bus

@pytest.fixture(autouse=True)
def run_around_tests():
    # Before test
    bus.clear_subscribers()
    yield
    # After test
    bus.clear_subscribers()

@pytest.mark.asyncio
async def test_risk_engine_critical():
    # Set threshold high to trigger
    engine = RiskEngine(threshold=0.20)
    
    verdicts = []
    def on_verdict(data):
        verdicts.append(data)
    
    bus.subscribe("risk_verdict", on_verdict)
    
    # Trigger critical
    await bus.publish("position_update", {"symbol": "BTC-PERP", "margin": 0.15})
    
    # Allow some time for async dispatch
    await asyncio.sleep(0.1)
    
    assert len(verdicts) > 0
    assert verdicts[0]["status"] == "CRITICAL"
    assert verdicts[0]["margin"] == 0.15

@pytest.mark.asyncio
async def test_risk_engine_safe():
    engine = RiskEngine(threshold=0.10)
    
    verdicts = []
    def on_verdict(data):
        verdicts.append(data)
    
    bus.subscribe("risk_verdict", on_verdict)
    
    # Trigger safe
    await bus.publish("position_update", {"symbol": "ETH-PERP", "margin": 0.15})
    
    await asyncio.sleep(0.1)
    
    # Should NOT have published a risk_verdict CRITICAL
    # (Note: bus instance is shared, so we clear or use fresh one if possible, 
    # but for simple unit test this works)
    critical_verdicts = [v for v in verdicts if v["symbol"] == "ETH-PERP"]
    assert len(critical_verdicts) == 0
