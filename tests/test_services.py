import pytest
import asyncio
from unittest.mock import MagicMock, patch
from src.services.arc_pinner import ArcPinner
from src.services.circle_rescuer import CircleRescuer

@pytest.mark.asyncio
async def test_arc_pinner_simulated():
    # Test with no private key (simulated mode)
    with patch('os.getenv', return_value=None):
        pinner = ArcPinner()
        tx_hash = await pinner.pin("0xabc123")
        assert tx_hash == "0xSIMULATED_ARC_TX"

@pytest.mark.asyncio
async def test_arc_pinner_missing_registry():
    # Test with private key but default/zero registry address
    with patch('os.getenv') as mock_env:
        mock_env.side_effect = lambda k, d=None: "0xkey" if k == "AGENT_PRIVATE_KEY" else (d if d is not None else None)
        pinner = ArcPinner()
        pinner.registry_address = "0x0000000000000000000000000000000000000000"
        tx_hash = await pinner.pin("0xabc123")
        assert tx_hash == "0xMISSING_REGISTRY_ADDR"

@pytest.mark.asyncio
async def test_circle_rescuer_mock_mode():
    # Test with no API keys (mock mode)
    with patch('os.getenv', return_value=None):
        rescuer = CircleRescuer()
        tx_id = await rescuer.rescue(100.0, "0xrecipient", "0xhash1")
        assert tx_id == "0xSIMULATED_CIRCLE_TX"

@pytest.mark.asyncio
async def test_circle_rescuer_missing_wallet():
    # Test with API keys but no wallet ID
    with patch('os.getenv') as mock_env:
        def side_effect(k, d=None):
            if k == "CIRCLE_API_KEY": return "api_key"
            if k == "CIRCLE_ENTITY_SECRET": return "entity_secret"
            if k == "CIRCLE_WALLET_ID": return None
            return d
        mock_env.side_effect = side_effect
        
        with patch('circle.web3.utils.init_developer_controlled_wallets_client'):
            rescuer = CircleRescuer()
            tx_id = await rescuer.rescue(100.0, "0xrecipient", "0xhash1")
            assert tx_id == "0xMISSING_WALLET_ID"
