import asyncio
from collections import defaultdict
from typing import Callable, Any, Dict, List

class MessageBus:
    """
    A simple in-memory async message bus for inter-module coordination.
    Modules can subscribe to topics and publish JSON-serializable signals.
    
    Design Choice: Decoupled Event-Driven Architecture.
    Modules do not know about each other; they only interact via the bus.
    """
    def __init__(self):
        # Using a list of callbacks for each topic
        self._subscribers: Dict[str, List[Callable]] = defaultdict(list)

    def subscribe(self, topic: str, callback: Callable[[Any], None]):
        """Subscribe to a specific topic."""
        if callback not in self._subscribers[topic]:
            self._subscribers[topic].append(callback)

    async def publish(self, topic: str, data: Any):
        """Publish a message to all subscribers of a topic."""
        if topic in self._subscribers:
            # Execute all callbacks registered for this topic
            tasks = []
            for callback in self._subscribers[topic]:
                if asyncio.iscoroutinefunction(callback):
                    tasks.append(callback(data))
                else:
                    # For non-async callbacks, we wrap them to keep the loop moving
                    callback(data)
            
            if tasks:
                await asyncio.gather(*tasks)

    def unsubscribe(self, topic: str, callback: Callable):
        """Remove a subscriber from a topic."""
        if topic in self._subscribers:
            if callback in self._subscribers[topic]:
                self._subscribers[topic].remove(callback)

# Global bus instance for easy import across modules
bus = MessageBus()
