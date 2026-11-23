import pytest
import asyncio
from src.bus import MessageBus
from src.events import BaseEvent
from dataclasses import dataclass


@dataclass(frozen=True)
class MockEvent(BaseEvent):
    key: str


@pytest.mark.asyncio
async def test_bus_pub_sub():
    bus = MessageBus()
    received_data = []

    def callback(event: MockEvent):
        received_data.append(event)

    bus.subscribe(MockEvent, callback)
    await bus.publish(MockEvent(key="value"))

    assert len(received_data) == 1
    assert received_data[0].key == "value"


@pytest.mark.asyncio
async def test_bus_async_callback():
    bus = MessageBus()
    received_data = []

    async def async_callback(event: MockEvent):
        await asyncio.sleep(0.01)
        received_data.append(event)

    bus.subscribe(MockEvent, async_callback)
    await bus.publish(MockEvent(key="ok"))

    assert len(received_data) == 1
    assert received_data[0].key == "ok"


@pytest.mark.asyncio
async def test_bus_handles_callback_exceptions_gracefully():
    from src.events import SystemError

    bus = MessageBus()

    received_errors = []

    def error_callback(event: SystemError):
        received_errors.append(event)

    bus.subscribe(SystemError, error_callback)

    received_data = []

    def safe_callback(event: MockEvent):
        received_data.append(event)

    def failing_callback(event: MockEvent):
        raise ValueError("Intentional crash")

    bus.subscribe(MockEvent, failing_callback)
    bus.subscribe(MockEvent, safe_callback)

    # This should complete without throwing
    await bus.publish(MockEvent(key="trigger"))

    # Safe callback should still have received the event
    assert len(received_data) == 1
    assert received_data[0].key == "trigger"

    # An error event should have been published
    assert len(received_errors) == 1
    assert received_errors[0].module == "MessageBus"
    assert "Intentional crash" in received_errors[0].message
