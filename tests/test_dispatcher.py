import pytest
import asyncio
from src.dispatcher import RescueDispatcher
from src.bus import bus
from src.events import ReasoningTrace, RescueComplete


@pytest.mark.asyncio
async def test_rescue_dispatcher_success(mocker):
    """Verifies successful rescue flow with mocked services."""
    # Mock services
    mock_pin = mocker.patch("src.services.arc_pinner.ArcPinner.pin", return_value="0xTX_PIN")
    mock_rescue = mocker.patch("src.services.circle_rescuer.CircleRescuer.rescue", return_value="0xTX_RESCUE")

    _dispatcher = RescueDispatcher("0x70997970C51812dc3A010C7d01b50e0d17dc79C8")
    
    received_completes = []
    async def on_complete(event: RescueComplete):
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
    await asyncio.sleep(0.1)

    assert len(received_completes) == 1
    assert received_completes[0].status == "SUCCESS"
    assert received_completes[0].tx_hash == "0xTX_RESCUE"
    assert mock_pin.called
    assert mock_rescue.called


@pytest.mark.asyncio
async def test_rescue_dispatcher_failure(mocker):
    """Verifies that the dispatcher handles a service failure gracefully."""
    # Mock failure in CircleRescuer
    mocker.patch("src.services.arc_pinner.ArcPinner.pin", return_value="0xTX_PIN")
    mocker.patch("src.services.circle_rescuer.CircleRescuer.rescue", return_value="0xFAILED_CIRCLE_TX_401")

    _dispatcher = RescueDispatcher("0x70997970C51812dc3A010C7d01b50e0d17dc79C8")
    
    received_completes = []
    async def on_complete(event: RescueComplete):
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
    await asyncio.sleep(0.1)

    assert len(received_completes) == 1
    assert received_completes[0].status == "FAILED"
    assert "FAILED" in received_completes[0].tx_hash
