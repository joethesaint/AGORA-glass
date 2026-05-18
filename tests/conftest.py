import pytest
from src.bus import bus
from src.analytics import analytics
from src.events import PositionUpdate, ReasoningTrace, RescueComplete


@pytest.fixture(autouse=True)
def run_around_tests():
    """
    Automatically runs before and after each test to ensure
    the MessageBus subscriptions are fully cleared, maintaining test isolation.
    """
    bus.clear_subscribers()
    # Re-subscribe singletons
    analytics.subscribe(PositionUpdate, analytics.on_position)
    analytics.subscribe(ReasoningTrace, analytics.on_trace)
    analytics.subscribe(RescueComplete, analytics.on_rescue)
    yield
    bus.clear_subscribers()
