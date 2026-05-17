import pytest
import asyncio
from src.engine import RiskEngine
from src.bus import bus
from src.events import PositionUpdate, RiskVerdict

@pytest.fixture(autouse=True)
def run_around_tests():
    bus.clear_subscribers()
    yield
    bus.clear_subscribers()

@pytest.mark.asyncio
async def test_risk_engine_critical():
    engine = RiskEngine(threshold=0.20)
    
    verdicts = []
    def on_verdict(event: RiskVerdict):
        verdicts.append(event)
    
    bus.subscribe(RiskVerdict, on_verdict)
    
    # Trigger critical
    await bus.publish(PositionUpdate(symbol="BTC-PERP", margin_ratio=0.15, leverage="5x"))
    
    await asyncio.sleep(0.1)
    
    assert len(verdicts) > 0
    assert verdicts[0].status == "CRITICAL"
    assert verdicts[0].margin == 0.15

@pytest.mark.asyncio
async def test_risk_engine_safe():
    engine = RiskEngine(threshold=0.10)
    
    verdicts = []
    def on_verdict(event: RiskVerdict):
        verdicts.append(event)
    
    bus.subscribe(RiskVerdict, on_verdict)
    
    # Trigger safe
    await bus.publish(PositionUpdate(symbol="ETH-PERP", margin_ratio=0.15, leverage="5x"))
    
    await asyncio.sleep(0.1)
    
    critical_verdicts = [v for v in verdicts if v.symbol == "ETH-PERP"]
    assert len(critical_verdicts) == 0
