import asyncio
from collections import defaultdict
from typing import Callable, Any, Dict, List, Type, TypeVar
from src.events import BaseEvent

T = TypeVar("T", bound=BaseEvent)

class MessageBus:
    """
    A type-safe, in-memory async message bus for inter-module coordination.
    Modules subscribe to Event Types rather than string topics.
    """
    def __init__(self):
        self._subscribers: Dict[Type[BaseEvent], List[Callable]] = defaultdict(list)

    def subscribe(self, event_type: Type[T], callback: Callable[[T], Any]):
        """Subscribe to a specific Event Type."""
        if callback not in self._subscribers[event_type]:
            self._subscribers[event_type].append(callback)

    async def publish(self, event: BaseEvent):
        """
        Publish an event to all subscribers of its type.
        """
        event_type = type(event)
        if event_type in self._subscribers:
            tasks = []
            for callback in self._subscribers[event_type]:
                if asyncio.iscoroutinefunction(callback):
                    tasks.append(callback(event))
                else:
                    callback(event)
            
            if tasks:
                await asyncio.gather(*tasks)

    def unsubscribe(self, event_type: Type[T], callback: Callable[[T], Any]):
        """Remove a subscriber from an event type."""
        if event_type in self._subscribers:
            if callback in self._subscribers[event_type]:
                self._subscribers[event_type].remove(callback)

    def clear_subscribers(self):
        """Remove all subscribers (useful for testing)."""
        self._subscribers.clear()

# Global bus instance
bus = MessageBus()
