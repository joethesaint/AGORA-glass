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
    # Using a valid 32-byte private key (standard test key)
    test_key = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
    
    _dispatcher = RescueDispatcher(agent_private_key=test_key)
    
    # Mock the internal pinning and rescue methods
    mocker.patch.object(_dispatcher, "pin_to_arc", return_value="0xTX_PIN")
    mocker.patch.object(_dispatcher, "execute_circle_rescue", return_value=None)
    
    results = []
    def on_complete(event: RescueComplete):
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
        reasoning_text="test"
    )
    
    await bus.publish(mock_trace)
    await asyncio.sleep(0.1)
    
    assert len(results) == 1
    assert results[0].status == "SUCCESS"
    assert results[0].amount == 100.0
