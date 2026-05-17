import pytest
import asyncio
from src.engine import RiskEngine
from src.bus import bus
from src.events import PositionUpdate, RiskVerdict


@pytest.mark.asyncio
async def test_risk_engine_critical_margin():
    # Use the singleton or a new instance, both follow the 12% rule now
    _engine = RiskEngine()
    
    verdicts = []
    def on_verdict(event: RiskVerdict):
        verdicts.append(event)
    
    bus.subscribe(RiskVerdict, on_verdict)
    
    # Trigger critical margin (0.09 < 0.12)
    await bus.publish(PositionUpdate(symbol="BTC-PERP", margin_ratio=0.09, leverage=2.0))
    
    await asyncio.sleep(0.1)
    
    assert len(verdicts) > 0
    assert verdicts[0].status == "CRITICAL"
    assert verdicts[0].margin == 0.09

@pytest.mark.asyncio
async def test_risk_engine_critical_leverage():
    _engine = RiskEngine()
    
    verdicts = []
    def on_verdict(event: RiskVerdict):
        verdicts.append(event)
    
    bus.subscribe(RiskVerdict, on_verdict)
    
    # Trigger critical leverage (6.0 > 5.0)
    await bus.publish(PositionUpdate(symbol="BTC-PERP", margin_ratio=0.15, leverage=6.0))
    
    await asyncio.sleep(0.1)
    
    # Filter for the specific symbol to avoid noise from other tests
    my_verdicts = [v for v in verdicts if v.leverage == 6.0]
    assert len(my_verdicts) > 0
    assert my_verdicts[0].status == "CRITICAL"

@pytest.mark.asyncio
async def test_risk_engine_safe():
    _engine = RiskEngine()
    
    verdicts = []
    def on_verdict(event: RiskVerdict):
        verdicts.append(event)
    
    bus.subscribe(RiskVerdict, on_verdict)
    
    # Trigger safe (0.15 > 0.12 and 3.0 < 5.0)
    await bus.publish(PositionUpdate(symbol="ETH-PERP", margin_ratio=0.15, leverage=3.0))
    
    await asyncio.sleep(0.1)
    
    critical_verdicts = [v for v in verdicts if v.symbol == "ETH-PERP"]
    assert len(critical_verdicts) == 0
