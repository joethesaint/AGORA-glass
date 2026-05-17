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
