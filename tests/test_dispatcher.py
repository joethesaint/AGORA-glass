import pytest
import asyncio
from src.dispatcher import RescueDispatcher
from src.events import ReasoningTrace, RescueComplete
from src.bus import bus


@pytest.fixture(autouse=True)
def run_around_tests():
    bus.clear_subscribers()
    yield
    bus.clear_subscribers()


@pytest.mark.asyncio
async def test_rescue_dispatcher_success(mocker):
    """Verifies successful rescue flow with mocked services."""
    # Mock services
    mock_pin = mocker.patch(
        "src.services.arc_pinner.ArcPinner.pin", return_value="0xTX_PIN"
    )
    mock_rescue = mocker.patch(
        "src.services.circle_rescuer.CircleRescuer.rescue", return_value="0xTX_RESCUE"
    )

    _dispatcher = RescueDispatcher()

    results = []

    async def on_complete(event: RescueComplete):
        results.append(event)

    bus.subscribe(RescueComplete, on_complete)

    mock_trace = ReasoningTrace(
        agent_id="test",
        action="RESCUE",
        account="0xRECIPIENT",
        leverage_before=5.0,
        margin_ratio=0.09,
        rescue_amount_usdc=100.0,
        evidence=[],
        risk_rating="CRITICAL",
        reason_hash="0x123",
        reasoning_text="test",
    )

    await bus.publish(mock_trace)
    await asyncio.sleep(0.1)

    assert len(results) == 1
    assert results[0].status == "SUCCESS"
    assert results[0].amount == 100.0
    assert mock_pin.called
    assert mock_rescue.called


@pytest.mark.asyncio
async def test_rescue_dispatcher_failure(mocker):
    """Verifies failed rescue handling with mocked services."""
    # Mock services with failure
    mocker.patch("src.services.arc_pinner.ArcPinner.pin", return_value="0xTX_PIN")
    mocker.patch(
        "src.services.circle_rescuer.CircleRescuer.rescue",
        return_value="0xFAILED_CIRCLE_TX_401",
    )

    _dispatcher = RescueDispatcher()

    results = []

    async def on_complete(event: RescueComplete):
        results.append(event)

    bus.subscribe(RescueComplete, on_complete)

    mock_trace = ReasoningTrace(
        agent_id="test",
        action="RESCUE",
        account="0xRECIPIENT",
        leverage_before=5.0,
        margin_ratio=0.09,
        rescue_amount_usdc=100.0,
        evidence=[],
        risk_rating="CRITICAL",
        reason_hash="0x123",
        reasoning_text="test",
    )

    await bus.publish(mock_trace)
    await asyncio.sleep(0.1)

    assert len(results) == 1
    assert results[0].status == "FAILED"
    assert "FAILED" in results[0].tx_hash
