import pytest
import asyncio
from src.monitor import PerpMonitor
from src.bus import bus
from src.events import PositionUpdate


@pytest.mark.asyncio
async def test_perp_monitor_mock_publish(monkeypatch):
    """
    Verifies that running the PerpMonitor publishes the sequence of 3 mock updates.
    Uses monkeypatching to mock asyncio.sleep so the test executes instantly.
    """
    monitor = PerpMonitor(mode="mock")

    received_updates = []

    def on_position_update(event: PositionUpdate):
        received_updates.append(event)

    bus.subscribe(PositionUpdate, on_position_update)

    # Fast mock sleep using original sleep to avoid recursion
    original_sleep = asyncio.sleep

    async def mock_sleep(secs):
        await original_sleep(0.0001)

    monkeypatch.setattr(asyncio, "sleep", mock_sleep)

    # Start monitor in background
    monitor_task = asyncio.create_task(monitor.run())

    # Wait until we have 3 updates
    for _ in range(50):  # timeout after 5s
        if len(received_updates) >= 3:
            break
        await asyncio.sleep(0.1)

    monitor_task.cancel()
    try:
        await monitor_task
    except asyncio.CancelledError:
        pass

    assert len(received_updates) >= 3
    assert received_updates[0].symbol == "BTC-PERP"
    assert received_updates[0].margin_ratio == 0.15
    assert received_updates[1].margin_ratio == 0.13
    assert received_updates[2].margin_ratio == 0.09
