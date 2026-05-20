import pytest
import asyncio
from src.monitor import PerpMonitor
from src.events import PositionUpdate
from src.bus import bus

@pytest.fixture(autouse=True)
def run_around_tests():
    bus.clear_subscribers()
    yield
    bus.clear_subscribers()

@pytest.mark.asyncio
async def test_perp_monitor_mock_publish(monkeypatch):
    """
    Verifies that running the PerpMonitor publishes the sequence of mock updates.
    """
    monitor = PerpMonitor(mode="mock")

    received_updates = []

    def on_position_update(event: PositionUpdate):
        received_updates.append(event)

    bus.subscribe(PositionUpdate, on_position_update)

    # Fast mock sleep
    original_sleep = asyncio.sleep
    async def mock_sleep(secs):
        await original_sleep(0.0001)

    monkeypatch.setattr(asyncio, "sleep", mock_sleep)

    # Start monitor task
    monitor_task = asyncio.create_task(monitor.run())

    # Wait for updates
    for _ in range(50):
        if len(received_updates) >= 3:
            break
        await asyncio.sleep(0.01)

    monitor_task.cancel()
    
    assert len(received_updates) >= 3
    assert received_updates[0].symbol == "BTC-PERP"
    assert received_updates[0].margin_ratio == 0.35 # Updated to match monitor.py
    assert received_updates[2].margin_ratio == 0.09
