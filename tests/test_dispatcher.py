import pytest
import asyncio
from src.dispatcher import RescueDispatcher
from src.bus import bus
from src.events import ReasoningTrace, RescueComplete


@pytest.mark.asyncio
async def test_rescue_dispatcher_flow():
    """
    Verifies that when a ReasoningTrace event is published, the RescueDispatcher
    runs its pin-to-arc and Circle-rescue simulations and fires a RescueComplete event.
    """
    _dispatcher = RescueDispatcher("0x70997970C51812dc3A010C7d01b50e0d17dc79C8")
    received_completes = []

    def on_complete(event: RescueComplete):
        received_completes.append(event)

    bus.subscribe(RescueComplete, on_complete)

    mock_trace = ReasoningTrace(
        agent_id="test-agent",
        action="TEST_ACTION",
        account="0xTEST",
        leverage_before=5.0,
        margin_ratio=0.09,
        rescue_amount_usdc=250.0,
        evidence=["test evidence"],
        risk_rating="CRITICAL",
        reason_hash="0x12345",
        reasoning_text="Test reasoning text",
    )

    await bus.publish(mock_trace)

    # Wait for the async handlers to execute (0.1s sleep inside dispatcher functions)
    await asyncio.sleep(0.3)

    assert len(received_completes) == 1
    assert received_completes[0].status == "SUCCESS"
    assert received_completes[0].amount == 250.0
