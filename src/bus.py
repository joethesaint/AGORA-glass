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
        Publish an event to all subscribers of its type safely.
        Individual subscriber failures are caught, logged, and isolated.
        """
        event_type = type(event)
        if event_type in self._subscribers:
            tasks = []
            for callback in self._subscribers[event_type]:

                async def safe_execute(cb, ev):
                    try:
                        if asyncio.iscoroutinefunction(cb):
                            await cb(ev)
                        else:
                            cb(ev)
                    except Exception as e:
                        import logging
                        import traceback
                        from src.events import SystemError

                        logger = logging.getLogger("MessageBus")
                        err_msg = str(e)
                        tb_str = traceback.format_exc()
                        logger.error(
                            f"Error executing subscriber callback '{cb.__name__ if hasattr(cb, '__name__') else str(cb)}': {err_msg}\n{tb_str}"
                        )
                        if not isinstance(ev, SystemError):
                            try:
                                await self.publish(
                                    SystemError(
                                        module="MessageBus",
                                        message=f"Subscriber callback error: {err_msg}",
                                        error_type=type(e).__name__,
                                    )
                                )
                            except Exception as pub_err:
                                logger.critical(
                                    f"Failed to publish SystemError: {pub_err}"
                                )

                tasks.append(safe_execute(callback, event))

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
