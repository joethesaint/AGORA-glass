import asyncio
import functools
import logging
import traceback
from typing import Callable, Any
from src.events import SystemError

logger = logging.getLogger("ErrorSystem")


def safe_handler(module_name: str):
    """
    Decorator for async event handlers to catch unhandled exceptions,
    log them with a traceback, and publish a SystemError event to the bus.
    """

    def decorator(func: Callable[..., Any]):
        if asyncio.iscoroutinefunction(func):

            @functools.wraps(func)
            async def async_wrapper(*args, **kwargs):
                try:
                    return await func(*args, **kwargs)
                except Exception as e:
                    err_msg = str(e)
                    tb_str = traceback.format_exc()
                    logger.error(
                        f"Unhandled exception in module '{module_name}' handler '{func.__name__}': {err_msg}\n{tb_str}"
                    )
                    # Dynamically import bus to prevent circular imports
                    from src.bus import bus

                    try:
                        await bus.publish(
                            SystemError(
                                module=module_name,
                                message=err_msg,
                                error_type=type(e).__name__,
                            )
                        )
                    except Exception as pub_err:
                        logger.critical(
                            f"Failed to publish SystemError event: {str(pub_err)}"
                        )

            return async_wrapper
        else:

            @functools.wraps(func)
            def sync_wrapper(*args, **kwargs):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    err_msg = str(e)
                    tb_str = traceback.format_exc()
                    logger.error(
                        f"Unhandled exception in module '{module_name}' handler '{func.__name__}': {err_msg}\n{tb_str}"
                    )
                    # For sync handlers, we run the event publishing in an async task if an event loop exists
                    from src.bus import bus

                    try:
                        loop = asyncio.get_running_loop()
                        if loop.is_running():
                            loop.create_task(
                                bus.publish(
                                    SystemError(
                                        module=module_name,
                                        message=err_msg,
                                        error_type=type(e).__name__,
                                    )
                                )
                            )
                    except RuntimeError:
                        # No running event loop, we log it and continue
                        logger.warning(
                            "Could not publish SystemError event because no asyncio event loop is running."
                        )

            return sync_wrapper

    return decorator
