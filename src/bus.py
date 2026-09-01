import asyncio
import logging
import traceback
from collections import defaultdict
from typing import Callable, Any, Dict, List, Type, TypeVar
from src.events import BaseEvent

T = TypeVar("T", bound=BaseEvent)

_bus_logger = logging.getLogger("MessageBus")


async def _safe_execute(cb: Callable, ev: BaseEvent, bus_publish: Callable) -> None:
    """Module-level coroutine — defined once, reused for every subscriber call.

    Keeping this outside the class and outside the publish loop means Python
    does NOT allocate a new function object on each iteration of the subscriber
    list, which was the previous behaviour when safe_execute was defined inside
    the for-loop.
    """
    try:
        if asyncio.iscoroutinefunction(cb):
            await cb(ev)
        else:
            cb(ev)
    except Exception as e:
        from src.events import SystemError  # local import avoids circular dep at module load

        err_msg = str(e)
        tb_str = traceback.format_exc()
        cb_name = getattr(cb, "__name__", repr(cb))
        _bus_logger.error(
            f"Error executing subscriber callback '{cb_name}': {err_msg}\n{tb_str}"
        )
        if not isinstance(ev, SystemError):
            try:
                await bus_publish(
                    SystemError(
                        module="MessageBus",
                        message=f"Subscriber callback error: {err_msg}",
                        error_type=type(e).__name__,
                    )
                )
            except Exception as pub_err:
                _bus_logger.critical(f"Failed to publish SystemError: {pub_err}")


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
        for cb in subscribers:
            is_coro = self._is_coro_cache.get(cb, True)
            try:
                if is_coro:
                    coros.append(cb(event))
                else:
                    cb(event)
            except Exception as e:
                _bus_logger.error(f"Sync callback error: {e}")
        
        if coros:
            await asyncio.gather(*coros, return_exceptions=True)

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
