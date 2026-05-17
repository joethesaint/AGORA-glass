import asyncio
from collections import defaultdict
from typing import Callable, Any, Dict

class MessageBus:
    """
    A simple in-memory async message bus for inter-module coordination.
    Modules can subscribe to topics and publish JSON-serializable signals.
    """
    def __init__(self):
        self._subscribers: Dict[str, list] = defaultdict(list)

    def subscribe(self, topic: str, callback: Callable[[Any], None]):
        """Subscribe to a specific topic."""
        self._subscribers[topic].append(callback)

    async def publish(self, topic: str, data: Any):
        """Publish a message to all subscribers of a topic."""
        if topic in self._subscribers:
            for callback in self._subscribers[topic]:
                if asyncio.iscoroutinefunction(callback):
                    await callback(data)
                else:
                    callback(data)

# Global bus instance for easy import
bus = MessageBus()
