import pytest
import asyncio
from unittest.mock import MagicMock, patch, AsyncMock
from src.dispatcher import RescueDispatcher
from src.events import ReasoningTrace, RescueComplete
from src.bus import bus

@pytest.mark.asyncio
async def test_dispatcher_on_reasoning_trace_flow():
    # Test the full flow: pin_to_arc -> execute_circle_rescue -> publish RescueComplete
    dispatcher = RescueDispatcher()
    
    # Mock internal methods to avoid real network calls
    dispatcher.pin_to_arc = AsyncMock(return_value="0xTX_HASH")
    dispatcher.execute_circle_rescue = AsyncMock()
    
    # Track completion events
    results = []
    def on_complete(ev): results.append(ev)
    bus.subscribe(RescueComplete, on_complete)
    
    event = ReasoningTrace(
        agent_id="test_agent",
        action="RESCUE_INITIATED",
        account="0x123",
        leverage_before=10.0,
        margin_ratio=0.08,
        rescue_amount_usdc=500.0,
        evidence=["test"],
        risk_rating="CRITICAL",
        reason_hash="0xhash",
        reasoning_text="{}"
    )
    
    await dispatcher.on_reasoning_trace(event)
    
    # Verify calls
    dispatcher.pin_to_arc.assert_called_once_with("0xhash")
    dispatcher.execute_circle_rescue.assert_called_once_with(500.0, "0x123")
    
    # Verify event publication
    assert len(results) == 1
    assert results[0].tx_hash == "0xTX_HASH"
    assert results[0].status == "SUCCESS"

@pytest.mark.asyncio
async def test_dispatcher_pin_to_arc_real_logic():
    # Test the actual pin_to_arc method logic (ABI setup and signing)
    with patch('os.getenv') as mock_env:
        mock_env.side_effect = lambda k, d=None: {
            "AGENT_PRIVATE_KEY": "0x" + "1" * 64,
            "REGISTRY_ADDRESS": "0x" + "2" * 40,
            "RPC": "http://localhost:8545"
        }.get(k, d)
        
        dispatcher = RescueDispatcher()
        
        # Mock web3
        dispatcher.w3 = MagicMock()
        dispatcher.w3.eth.get_transaction_count.return_value = 1
        dispatcher.w3.to_wei.return_value = 10**16
        
        mock_contract = MagicMock()
        dispatcher.w3.eth.contract.return_value = mock_contract
        mock_contract.functions.storeReason().build_transaction.return_value = {"data": "0x"}
        
        # Mock signing and sending
        dispatcher.w3.eth.account.sign_transaction.return_value = MagicMock(rawTransaction=b"signed_tx")
        dispatcher.w3.eth.send_raw_transaction.return_value = MagicMock(hex=lambda: "0xfinal_hash")
        
        tx_hash = await dispatcher.pin_to_arc("0x" + "a" * 64)
        assert tx_hash == "0xfinal_hash"

@pytest.mark.asyncio
async def test_dispatcher_pin_to_arc_failure_handling():
    dispatcher = RescueDispatcher()
    dispatcher.w3 = MagicMock()
    dispatcher.account = MagicMock()
    dispatcher.registry_address = "0xaddress"
    
    # Trigger an exception during transaction building
    dispatcher.w3.eth.contract.side_effect = Exception("Web3 Error")
    
    tx_hash = await dispatcher.pin_to_arc("0xhash")
    assert tx_hash is None
