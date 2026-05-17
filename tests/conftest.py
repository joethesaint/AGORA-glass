import pytest
from src.bus import bus


@pytest.fixture(autouse=True)
def run_around_tests():
    """
    Automatically runs before and after each test to ensure
    the MessageBus subscriptions are fully cleared, maintaining test isolation.
    """
    bus.clear_subscribers()
    yield
    bus.clear_subscribers()
