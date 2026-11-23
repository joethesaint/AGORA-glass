import asyncio
import pytest
from src.errors import safe_handler
from src.bus import bus
from src.events import SystemError


@pytest.mark.asyncio
async def test_safe_handler_async_decorator():
    """
    Verifies that the safe_handler decorator isolates async exceptions
    and publishes a descriptive SystemError event.
    """
    errors = []

    def on_error(event: SystemError):
        errors.append(event)

    bus.subscribe(SystemError, on_error)

    @safe_handler("TestModule")
    async def bad_handler():
        raise RuntimeError("Crash inside async handler")

    # The handler should run safely without bubbling up the exception
    await bad_handler()

    # Check that the exception was caught and reported on the bus
    assert len(errors) == 1
    assert errors[0].module == "TestModule"
    assert errors[0].error_type == "RuntimeError"
    assert "Crash inside async handler" in errors[0].message

@pytest.mark.asyncio
async def test_safe_handler_exception_logic():
    from src.errors import safe_handler
    from src.bus import bus
    
    # Track errors published to the bus
    system_errors = []
    def on_error(ev): system_errors.append(ev)
    bus.subscribe(SystemError, on_error)

    @safe_handler("TestModuleLogic")
    async def failing_async_task():
        raise ValueError("Triggered failure")

    await failing_async_task()
    
    # Give the async loop a moment to process bus publication if needed
    await asyncio.sleep(0.1)
    
    assert len(system_errors) > 0
    assert "Triggered failure" in system_errors[0].message
