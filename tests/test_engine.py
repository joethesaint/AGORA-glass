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

@pytest.mark.asyncio
async def test_risk_engine_dynamic_volatility():
    from src.events import MarketVolatilityUpdate
    _engine = RiskEngine()
    
    verdicts = []
    def on_verdict(event: RiskVerdict):
        verdicts.append(event)
    bus.subscribe(RiskVerdict, on_verdict)
    
    # 1. Update volatility to high (1.0)
    # Critical threshold = base(0.12) + (vol(1.0) * mult(0.05)) = 0.17
    await bus.publish(MarketVolatilityUpdate(symbol="VOL-PERP", volatility_factor=1.0))
    
    # 2. Publish margin that is safe normally (0.15) but critical with high vol (0.15 < 0.17)
    await bus.publish(PositionUpdate(symbol="VOL-PERP", margin_ratio=0.15, leverage=2.0))
    
    await asyncio.sleep(0.1)
    
    my_verdicts = [v for v in verdicts if v.symbol == "VOL-PERP"]
    assert len(my_verdicts) > 0
    assert my_verdicts[0].status == "CRITICAL"

@pytest.mark.asyncio
async def test_risk_engine_deteriorating_trend():
    from src.analytics import analytics
    _engine = RiskEngine()
    
    verdicts = []
    def on_verdict(event: RiskVerdict):
        verdicts.append(event)
    bus.subscribe(RiskVerdict, on_verdict)
    
    # 1. Establish a sharp downward trend
    # analytics.is_trend_deteriorating needs at least 10 points
    symbol = "TREND-PERP"
    for i in range(12):
        # Margin drops from 0.40 to 0.29. 
        # older (first 5) avg approx 0.38, recent (last 5) avg approx 0.31.
        # delta = 0.31 - 0.38 = -0.07 < -0.05 threshold.
        margin = 0.40 - (i * 0.01) 
        await bus.publish(PositionUpdate(symbol=symbol, margin_ratio=margin, leverage=2.0))
        await asyncio.sleep(0.01)
    
    # Check if a critical verdict was triggered due to trend even though margin (0.29) > threshold (0.12)
    my_verdicts = [v for v in verdicts if v.symbol == symbol]
    assert len(my_verdicts) > 0
    assert any(v.status == "CRITICAL" for v in my_verdicts)
