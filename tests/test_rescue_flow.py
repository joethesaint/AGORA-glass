"""Rescue-flow guards found while recording the demo (23 Nov 2026).

Before these fixes the mock agent started about 12 rescues a second: the
comparative trading agent's audit traces were dispatched as rescues, every
tick re-rescued the same falling position, and mock positions never recovered.
"""
import asyncio

import pytest

from src.bus import bus
from src.dispatcher import RescueDispatcher
from src.events import ReasoningTrace, RescueComplete
from src.monitor import PerpMonitor


@pytest.fixture(autouse=True)
def clean_bus():
    bus.clear_subscribers()
    yield
    bus.clear_subscribers()


def trace(action="RESCUE_INITIATED", symbol="BTC-PERP", reason_hash="0xabc"):
    return ReasoningTrace(
        agent_id="test", action=action, account="0xACC", leverage_before=6.0,
        margin_ratio=0.08, rescue_amount_usdc=500.0, evidence=["test"],
        risk_rating="CRITICAL", reason_hash=reason_hash, reasoning_text="{}",
        symbol=symbol,
    )


def collect_completions():
    done = []
    bus.subscribe(RescueComplete, lambda e: done.append(e))
    return done


@pytest.mark.asyncio
async def test_audit_only_traces_do_not_move_money(mocker):
    mocker.patch("src.services.arc_pinner.ArcPinner.pin", return_value="0xPIN")
    rescue = mocker.patch("src.services.circle_rescuer.CircleRescuer.rescue", return_value="0xTX")
    RescueDispatcher()
    done = collect_completions()

    await bus.publish(trace(action="DELEVERAGE"))
    await asyncio.sleep(0.05)

    rescue.assert_not_called()
    assert done == []


@pytest.mark.asyncio
async def test_one_rescue_in_flight_per_position(mocker):
    mocker.patch("src.services.arc_pinner.ArcPinner.pin", return_value="0xPIN")

    async def slow_rescue(**_kwargs):
        await asyncio.sleep(0.05)
        return "0xTX"

    rescue = mocker.patch("src.services.circle_rescuer.CircleRescuer.rescue", side_effect=slow_rescue)
    RescueDispatcher()
    done = collect_completions()

    # Three ticks of the same falling position while the first rescue runs,
    # plus one other position.
    await asyncio.gather(
        bus.publish(trace(reason_hash="0x1")),
        bus.publish(trace(reason_hash="0x2")),
        bus.publish(trace(reason_hash="0x3")),
        bus.publish(trace(symbol="ETH-PERP", reason_hash="0x4")),
    )
    await asyncio.sleep(0.1)

    assert rescue.call_count == 2
    assert sorted(e.symbol for e in done) == ["BTC-PERP", "ETH-PERP"]


@pytest.mark.asyncio
async def test_mock_position_recovers_after_successful_rescue():
    monitor = PerpMonitor(mode="mock")
    monitor.mock_states = {"BTC-PERP": {"margin": 0.06, "leverage": 7.0, "price": 60000.0}}

    await bus.publish(RescueComplete(status="SUCCESS", tx_hash="0xTX", amount=500.0,
                                     reason_hash="0x1", latency_ms=50.0, symbol="BTC-PERP"))

    assert monitor.mock_states["BTC-PERP"]["margin"] == 0.25  # 0.06 + 0.10 is under the target
    assert monitor.mock_states["BTC-PERP"]["leverage"] == 5.0


@pytest.mark.asyncio
async def test_failed_rescue_does_not_fake_a_recovery():
    monitor = PerpMonitor(mode="mock")
    monitor.mock_states = {"BTC-PERP": {"margin": 0.06, "leverage": 7.0, "price": 60000.0}}

    await bus.publish(RescueComplete(status="FAILED", tx_hash="0xFAILED", amount=500.0,
                                     reason_hash="0x1", latency_ms=50.0, symbol="BTC-PERP"))

    assert monitor.mock_states["BTC-PERP"]["margin"] == 0.06


@pytest.mark.asyncio
async def test_rescue_lifts_a_healthy_but_falling_position():
    monitor = PerpMonitor(mode="mock")
    monitor.mock_states = {"ETH-PERP": {"margin": 0.28, "leverage": 3.8, "price": 3000.0}}

    await bus.publish(RescueComplete(status="SUCCESS", tx_hash="0xTX", amount=500.0,
                                     reason_hash="0x1", latency_ms=50.0, symbol="ETH-PERP"))

    assert monitor.mock_states["ETH-PERP"]["margin"] == pytest.approx(0.38)
