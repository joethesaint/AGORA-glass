import asyncio
import logging
from collections import defaultdict
from typing import Callable, Any, Dict, List, Type, TypeVar
from src.events import BaseEvent

T = TypeVar("T", bound=BaseEvent)

_bus_logger = logging.getLogger("MessageBus")


class MessageBus:
    """A type-safe, in-memory async message bus for inter-module coordination.

    Modules subscribe to Event Types rather than string topics.
    """

    def __init__(self):
        """Initializes the subscriber registry."""
        self._subscribers: Dict[Type[BaseEvent], List[Callable]] = defaultdict(list)
        self._is_coro_cache: Dict[Callable, bool] = {}

    def subscribe(self, event_type: Type[T], callback: Callable[[T], Any]):
        """Subscribes to a specific Event Type."""
        if callback not in self._subscribers[event_type]:
            self._subscribers[event_type].append(callback)
            self._is_coro_cache[callback] = asyncio.iscoroutinefunction(callback)

    async def publish(self, event: BaseEvent):
        """Publishes an event to all subscribers of its type safely."""
        event_type = type(event)
        subscribers = self._subscribers.get(event_type)
        if not subscribers:
            return

        coros = []
        coro_cbs = []
        for cb in subscribers:
            is_coro = self._is_coro_cache.get(cb, True)
            try:
                if is_coro:
                    coros.append(cb(event))
                    coro_cbs.append(cb)
                else:
                    cb(event)
            except Exception as e:
                await self._report_error(cb, event, e)

        if coros:
            results = await asyncio.gather(*coros, return_exceptions=True)
            for cb, result in zip(coro_cbs, results):
                if isinstance(result, Exception):
                    await self._report_error(cb, event, result)

    async def _report_error(self, cb: Callable, event: BaseEvent, err: Exception) -> None:
        """Logs a subscriber failure and publishes it as a SystemError event.

        A failing subscriber never stops the others. A SystemError handler that
        fails is only logged, so an error can never loop back into the bus.
        """
        from src.events import SystemError  # local import avoids circular dep at module load

        cb_name = getattr(cb, "__name__", repr(cb))
        _bus_logger.error(f"Subscriber '{cb_name}' failed: {err}")
        if isinstance(event, SystemError):
            return
        try:
            await self.publish(
                SystemError(
                    module="MessageBus",
                    message=f"Subscriber callback error: {err}",
                    error_type=type(err).__name__,
                )
            )
        except Exception as pub_err:
            _bus_logger.critical(f"Failed to publish SystemError: {pub_err}")

    def unsubscribe(self, event_type: Type[T], callback: Callable[[T], Any]):
        """Removes a subscriber from an event type."""
        subs = self._subscribers.get(event_type)
        if subs and callback in subs:
            subs.remove(callback)

    def clear_subscribers(self):
        """Removes all subscribers from the registry. Useful for unit tests."""
        self._subscribers.clear()


# Global bus instance
bus = MessageBus()
