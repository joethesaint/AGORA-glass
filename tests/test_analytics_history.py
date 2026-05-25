import pytest
from src.analytics import GlassBoxAnalytics
from src.events import PositionUpdate

def test_analytics_history_tracking():
    engine = GlassBoxAnalytics()
    engine.reset()
    
    # Simulate multiple position updates
    updates = [
        PositionUpdate(symbol="BTC-PERP", margin_ratio=0.3, leverage=2.0, timestamp=100.0),
        PositionUpdate(symbol="BTC-PERP", margin_ratio=0.25, leverage=2.5, timestamp=101.0),
        PositionUpdate(symbol="BTC-PERP", margin_ratio=0.2, leverage=3.0, timestamp=102.0),
        PositionUpdate(symbol="ETH-PERP", margin_ratio=0.4, leverage=1.5, timestamp=100.0),
    ]
    
    for update in updates:
        engine.on_position(update)
    
    history = engine.get_history()
    
    # Check BTC-PERP history
    btc_margin = history["margin"]["BTC-PERP"]
    assert len(btc_margin) == 3
    assert btc_margin[0] == (100.0, 0.3)
    assert btc_margin[1] == (101.0, 0.25)
    assert btc_margin[2] == (102.0, 0.2)
    
    btc_leverage = history["leverage"]["BTC-PERP"]
    assert len(btc_leverage) == 3
    assert btc_leverage[0] == (100.0, 2.0)
    
    # Check ETH-PERP history
    eth_margin = history["margin"]["ETH-PERP"]
    assert len(eth_margin) == 1
    assert eth_margin[0] == (100.0, 0.4)

def test_analytics_position_state():
    engine = GlassBoxAnalytics()
    engine.reset()
    
    # Simulate position updates
    updates = [
        PositionUpdate(symbol="BTC-PERP", margin_ratio=0.3, leverage=2.0, current_price=60000.0, timestamp=100.0),
        PositionUpdate(symbol="BTC-PERP", margin_ratio=0.28, leverage=2.1, current_price=61000.0, timestamp=101.0),
        PositionUpdate(symbol="ETH-PERP", margin_ratio=0.4, leverage=1.5, current_price=3000.0, timestamp=100.0),
    ]
    
    for update in updates:
        engine.on_position(update)
    
    history = engine.get_history()
    
    # BTC-PERP should reflect the LATEST update
    btc = history["positions"]["BTC-PERP"]
    assert btc["current_price"] == 61000.0
    assert btc["margin_ratio"] == 0.28
    assert btc["leverage"] == 2.1
    
    # ETH-PERP should reflect its update
    eth = history["positions"]["ETH-PERP"]
    assert eth["current_price"] == 3000.0

def test_analytics_event_history():
    engine = GlassBoxAnalytics()
    engine.reset()
    
    # Simulate a mix of events
    updates = [
        PositionUpdate(symbol="BTC-PERP", margin_ratio=0.3, leverage=2.0, timestamp=100.0),
    ]
    for update in updates:
        engine.on_position(update)
    
    # Simulate a trace
    import asyncio
    from src.events import ReasoningTrace, RescueComplete
    
    trace = ReasoningTrace(
        agent_id="test", action="RESCUE", account="0x1", leverage_before=5.0,
        margin_ratio=0.1, rescue_amount_usdc=500.0, evidence=[], risk_rating="5",
        reason_hash="0xABC", reasoning_text="test", timestamp=101.0
    )
    # on_trace is async in the implementation but let's check if it needs await
    # In src/analytics.py it's async def on_trace
    loop = asyncio.get_event_loop()
    loop.run_until_complete(engine.on_trace(trace))
    
    rescue = RescueComplete(status="SUCCESS", tx_hash="0xTX", amount=500.0, reason_hash="0xABC", latency_ms=100.0, timestamp=102.0)
    loop.run_until_complete(engine.on_rescue(rescue))
    
    history = engine.get_history()
    events = history["events"]
    
    assert len(events) == 3
    assert events[0]["type"] == "PositionUpdate"
    assert events[1]["type"] == "ReasoningTrace"
    assert events[2]["type"] == "RescueComplete"
    assert events[1]["data"]["reason_hash"] == "0xABC"

def test_analytics_leverage_tracking():
    engine = GlassBoxAnalytics()
    engine.reset()
    
    # Simulate multiple position updates with varying leverage
    updates = [
        PositionUpdate(symbol="SOL-PERP", margin_ratio=0.3, leverage=3.0, timestamp=200.0),
        PositionUpdate(symbol="SOL-PERP", margin_ratio=0.28, leverage=4.5, timestamp=201.0),
        PositionUpdate(symbol="SOL-PERP", margin_ratio=0.25, leverage=3.8, timestamp=202.0),
    ]
    
    for update in updates:
        engine.on_position(update)
    
    history = engine.get_history()
    
    # Check SOL-PERP leverage history
    sol_leverage = history["leverage"]["SOL-PERP"]
    assert len(sol_leverage) == 3
    assert sol_leverage[0] == (200.0, 3.0)
    assert sol_leverage[1] == (201.0, 4.5)
    assert sol_leverage[2] == (202.0, 3.8)

def test_analytics_trend_deterioration():
    engine = GlassBoxAnalytics()
    engine.reset()
    
    # Simulate a decreasing trend
    for i in range(15):
        engine.on_position(PositionUpdate(
            symbol="BTC-PERP", 
            margin_ratio=0.5 - (i * 0.02), 
            leverage=2.0, 
            timestamp=float(i)
        ))
    
    # older_avg (first 5): (0.5+0.48+0.46+0.44+0.42)/5 = 0.44
    # recent_avg (last 5): (0.26+0.24+0.22+0.2+0.18)/5 = 0.22
    # diff = 0.22 > 0.05
    assert engine.is_trend_deteriorating("BTC-PERP") is True

    # Simulate a stable trend
    engine.reset()
    for i in range(15):
        engine.on_position(PositionUpdate(
            symbol="ETH-PERP", 
            margin_ratio=0.3, 
            leverage=2.0, 
            timestamp=float(i)
        ))
    assert engine.is_trend_deteriorating("ETH-PERP") is False
