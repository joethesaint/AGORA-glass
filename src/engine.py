import aiohttp
import os
import logging
import random
from src.base import BaseComponent
from src.events import PositionUpdate, RiskVerdict, MarketVolatilityUpdate, MarketRegimeUpdate, TradingSignal
from src.errors import safe_handler
from src.config import settings
from src.analytics import analytics

# Shared connector — reuses TCP connections across all remote evaluations.
# ttl_dns_cache avoids repeated DNS lookups; limit=10 caps concurrent connections.
_connector: aiohttp.TCPConnector | None = None
_session: aiohttp.ClientSession | None = None


async def _get_session() -> aiohttp.ClientSession:
    """Returns the process-wide shared aiohttp session, creating it on first call."""
    global _connector, _session
    if _session is None or _session.closed:
        _connector = aiohttp.TCPConnector(limit=10, ttl_dns_cache=300)
        _session = aiohttp.ClientSession(connector=_connector)
    return _session

class RiskEngine(BaseComponent):
    """
    Risk evaluation engine that supports Local (Safety Band) or Remote (API) logic.
    Enables 'Remote Swapping' of strategies via the REMOTE_AGENT_URL env var.
    """

    def __init__(self):
        super().__init__("RiskEngine")
        self.config = settings.risk
        self.volatility_state = {}
        self.regime_state = "RISK_ON"
        self.remote_url = os.getenv("REMOTE_AGENT_URL")

        if self.remote_url:
            self.logger.info(f"Initialized in REMOTE mode: {self.remote_url}")
        else:
            self.logger.info("Initialized in LOCAL mode (Cheng et al. 2021)")

        self.subscribe(PositionUpdate, self.on_position_update)
        self.subscribe(MarketVolatilityUpdate, self.on_volatility_update)
        self.subscribe(MarketRegimeUpdate, self.on_regime_update)

    @safe_handler("RiskEngine")
    async def on_volatility_update(self, event: MarketVolatilityUpdate):
        self.volatility_state[event.symbol] = event.volatility_factor

    @safe_handler("RiskEngine")
    async def on_regime_update(self, event: MarketRegimeUpdate):
        self.regime_state = event.regime
        self.logger.debug(f"RiskEngine regime adjusted to: {self.regime_state}")


    @safe_handler("RiskEngine")
    async def on_position_update(self, event: PositionUpdate):
        # 1. Standard Risk Evaluation (Sentinel Logic)
        if self.remote_url:
            await self._evaluate_remote(event)
        else:
            await self._evaluate_local(event)

        # 2. Proactive Trading Logic (if in trading mode)
        if settings.agent_mode == "trading":
            await self._execute_proactive_trading(event)

    async def _execute_proactive_trading(self, event: PositionUpdate):
        """Proactive autonomous trading logic based on volatility and trend."""
        vol_factor = self.volatility_state.get(event.symbol, 0.5)
        is_trending_down = analytics.is_trend_deteriorating(event.symbol)
        
        # Proactive De-risking: If volatility is high and trend is down, reduce leverage
        if vol_factor > 0.7 and is_trending_down:
            self.logger.info(f"TRADING AGENT: High vol ({vol_factor:.2f}) + Bearish trend. Proactive de-risk for {event.symbol}")
            await self.publish(TradingSignal(
                symbol=event.symbol,
                action="DE_RISK",
                reason=f"Volatility {vol_factor:.2f} too high for current trend",
                amount=0.5 * event.leverage, # Half leverage
                price=event.current_price
            ))
            
        # Proactive Entry: If volatility is very low and trend is stable, enter position
        elif vol_factor < 0.2 and not is_trending_down and random.random() < 0.05:
            self.logger.info(f"TRADING AGENT: Low vol ({vol_factor:.2f}) + Stable trend. Proactive entry for {event.symbol}")
            await self.publish(TradingSignal(
                symbol=event.symbol,
                action="BUY",
                reason=f"Volatility {vol_factor:.2f} suggests low risk for entry",
                amount=1.0, # 1 unit
                price=event.current_price
            ))

    async def _evaluate_remote(self, event: PositionUpdate):
        """Delegates risk decision to an external AI Agent.

        Uses the process-wide persistent aiohttp session so TCP connections are
        reused across calls — eliminates the 50-200ms handshake overhead that
        occurred when creating a new ClientSession per evaluation.
        """
        payload = {
            "symbol": event.symbol,
            "margin_ratio": event.margin_ratio,
            "leverage": event.leverage,
            "account": event.account,
            "current_price": event.current_price,
            "timestamp": event.timestamp,
            "mode": settings.agent_mode
        }

        try:
            session = await _get_session()
            async with session.post(
                f"{self.remote_url}/evaluate",
                json=payload,
                timeout=aiohttp.ClientTimeout(total=0.5)
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    await self.publish(RiskVerdict(
                        status=data.get("status", "SAFE"),
                        margin=event.margin_ratio,
                        leverage=event.leverage,
                        symbol=event.symbol,
                        risk_rating=data.get("risk_rating", 1),
                        account=event.account
                    ))
                else:
                    self.logger.error(f"Remote Agent returned {response.status}")
        except Exception as e:
            self.logger.error(f"Remote Agent unreachable: {type(e).__name__}")

    async def shutdown(self):
        """Closes the shared HTTP session cleanly on agent shutdown."""
        global _session, _connector
        if _session and not _session.closed:
            await _session.close()
        if _connector:
            await _connector.close()
        _session = None
        _connector = None
        self.logger.info("RiskEngine HTTP session closed.")

    async def _evaluate_local(self, event: PositionUpdate):
        """Original safety band logic based on research, enhanced with advanced quant math."""
        
        margin = event.margin_ratio
        leverage = event.leverage
        vol_factor = self.volatility_state.get(event.symbol, 0.5)
        
        # Fast Math: Inline VaR/ES using precomputed Z-scores (bypasses slow scipy.stats)
        # Z_99 = 2.3263, ES_FACTOR_99 = 2.6652, SQRT_DT = sqrt(1/252) ≈ 0.0630
        portfolio_val = event.current_price * leverage
        var_99 = abs(portfolio_val * vol_factor * 0.0630 * 2.3263)
        es_99 = abs(portfolio_val * vol_factor * 2.6652)
        
        self.logger.debug(f"[{event.symbol}] Quant Metrics - VaR99: ${var_99:.2f}, ES99: ${es_99:.2f}")

        dynamic_threshold = self.config.base_critical_threshold + (
            vol_factor * self.config.volatility_multiplier
        )

        is_trending_down = analytics.is_trend_deteriorating(event.symbol)
        is_mock = "0xMOCK" in event.account
        threshold_buffer = 0.05 if is_mock else 0.0
        
        # Determine criticality using both base heuristic and VaR/ES magnitude
        var_critical = var_99 > (portfolio_val * 0.15) # If VaR exceeds 15% of notional
        is_critical = margin < (dynamic_threshold + threshold_buffer) or leverage > self.config.max_leverage or is_trending_down or var_critical

        if is_critical:
            await self.publish(RiskVerdict(
                status="CRITICAL",
                margin=margin,
                leverage=leverage,
                symbol=event.symbol,
                risk_rating=5 if var_critical else 4,
                account=event.account,
            ))
        else:
            self.logger.info(f"Position {event.symbol} safe. Margin: {margin:.2%}")

# Instantiate singleton
engine = RiskEngine()
