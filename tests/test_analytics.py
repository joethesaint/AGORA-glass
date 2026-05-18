import pytest
import asyncio
from src.analytics import analytics
from src.events import ReasoningTrace, RescueComplete, WSSignal, PositionUpdate
from src.bus import bus

@pytest.fixture(autouse=True)
def run_around_tests():
    bus.clear_subscribers()
    # Re-subscribe the singleton
    analytics.subscribe(ReasoningTrace, analytics.on_trace)
    analytics.subscribe(RescueComplete, analytics.on_rescue)
    analytics.subscribe(PositionUpdate, analytics.on_position)
    
    analytics.reset()
    yield
    bus.clear_subscribers()
    analytics.reset()

@pytest.mark.asyncio
async def test_analytics_metrics_tracking():
    """Verifies that AnalyticsEngine correctly tracks rescue metrics."""
    # Track output signals
    signals = []
    async def on_signal(event: WSSignal):
        signals.append(event)
    bus.subscribe(WSSignal, on_signal)
    
    # 1. Start Trace
    trace = ReasoningTrace(
        agent_id="test",
        action="RESCUE_INITIATED",
        account="0x1",
        leverage_before=5.0,
        margin_ratio=0.09,
        rescue_amount_usdc=100.0,
        evidence=[],
        risk_rating="CRITICAL",
        reason_hash="0xhash1",
        reasoning_text="test"
    )
    await bus.publish(trace)
    
    # 2. Complete Rescue
    complete = RescueComplete(
        status="SUCCESS",
        tx_hash="0xtx1",
        amount=100.0,
        reason_hash="0xhash1",
        latency_ms=50.0
    )
    await bus.publish(complete)
    
    # Allow async processing
    await asyncio.sleep(0.1)
    
    # Check published analytics
    assert len(signals) > 0
    latest = signals[-1].payload
    assert latest["total_rescued_usdc"] == 100.0
    assert latest["rescue_count"] == 1
    assert latest["avg_latency_ms"] > 0
