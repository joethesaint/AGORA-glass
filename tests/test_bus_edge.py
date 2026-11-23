import pytest
import asyncio
from src.bus import MessageBus
from src.events import BaseEvent

class DummyEvent(BaseEvent):
    pass

@pytest.mark.asyncio
async def test_bus_unsubscribe():
    bus = MessageBus()
    count = 0
    def cb(ev):
        nonlocal count
        count += 1
    
    bus.subscribe(DummyEvent, cb)
    await bus.publish(DummyEvent())
    assert count == 1
    
    bus.unsubscribe(DummyEvent, cb)
    await bus.publish(DummyEvent())
    assert count == 1

@pytest.mark.asyncio
async def test_bus_multiple_subscribers():
    bus = MessageBus()
    results = []
    bus.subscribe(DummyEvent, lambda e: results.append(1))
    bus.subscribe(DummyEvent, lambda e: results.append(2))
    
    await bus.publish(DummyEvent())
    assert 1 in results
    assert 2 in results
