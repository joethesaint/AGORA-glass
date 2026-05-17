import pytest
import asyncio
from src.bus import MessageBus

@pytest.mark.asyncio
async def test_bus_pub_sub():
    bus = MessageBus()
    received_data = []

    def callback(data):
        received_data.append(data)

    bus.subscribe("test_topic", callback)
    await bus.publish("test_topic", {"key": "value"})
    
    assert len(received_data) == 1
    assert received_data[0]["key"] == "value"

@pytest.mark.asyncio
async def test_bus_async_callback():
    bus = MessageBus()
    received_data = []

    async def async_callback(data):
        await asyncio.sleep(0.01)
        received_data.append(data)

    bus.subscribe("test_async", async_callback)
    await bus.publish("test_async", {"status": "ok"})
    
    assert len(received_data) == 1
    assert received_data[0]["status"] == "ok"
