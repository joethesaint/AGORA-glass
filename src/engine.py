from src.base import BaseComponent
from src.events import PositionUpdate, RiskVerdict, MarketVolatilityUpdate
from src.errors import safe_handler
from src.config import settings
from src.analytics import analytics


class RiskEngine(BaseComponent):
    """
    Risk evaluation engine based on Cheng et al. (2021) safety bands.
    Uses dynamic thresholds adjusted by live market volatility and
    Polars-powered trend analytics.
    """

    def __init__(self):
        """Initializes the engine and dynamic threshold configuration."""
        super().__init__("RiskEngine")
        self.config = settings.risk
        self.volatility_state = {}  # Store latest volatility per symbol
        
        self.subscribe(PositionUpdate, self.on_position_update)
        self.subscribe(MarketVolatilityUpdate, self.on_volatility_update)

    @safe_handler("RiskEngine")
    async def on_volatility_update(self, event: MarketVolatilityUpdate):
        """Update the internal volatility state for a symbol."""
        self.volatility_state[event.symbol] = event.volatility_factor
        self.logger.debug(f"Updated volatility for {event.symbol}: {event.volatility_factor:.2f}")

    @safe_handler("RiskEngine")
    async def on_position_update(self, event: PositionUpdate):
        """
        Evaluate risk using dynamic thresholds and Polars analytics:
        1. Log data to analytics for trend tracking.
        2. Calculate Dynamic Threshold (Base + Volatility).
        3. Check for threshold breach or deteriorating trends.
        """
        # 1. High-performance analytics logging
        analytics.add_data_point(event.symbol, event.margin_ratio, event.leverage)
        
        # 2. Dynamic threshold calculation
        margin = event.margin_ratio
        leverage = event.leverage
        vol_factor = self.volatility_state.get(event.symbol, 0.5)
        
        dynamic_threshold = self.config.base_critical_threshold + (
            vol_factor * self.config.volatility_multiplier
        )

<<<<<<< HEAD
        is_critical = margin < dynamic_threshold or leverage > self.config.max_leverage
        verdict = "CRITICAL" if is_critical else "SAFE"

        self.logger.info(
            "risk_verdict",
            level=verdict,
            margin_ratio=margin,
            leverage=leverage,
            account=event.account,
            symbol=event.symbol,
            vol_factor=vol_factor,
            dynamic_threshold=dynamic_threshold,
            thresholds_applied={
                "base_critical": self.config.base_critical_threshold,
                "max_leverage": self.config.max_leverage,
                "volatility_multiplier": self.config.volatility_multiplier
            }
        )

        if is_critical:
=======
        # 3. Deteriorating trend detection (Polars)
        is_trending_down = analytics.is_trend_deteriorating(event.symbol)

        is_critical = margin < dynamic_threshold or leverage > self.config.max_leverage or is_trending_down

        if is_critical:
            reason = ""
            if margin < dynamic_threshold:
                reason = f"margin {margin:.2%} below dynamic threshold {dynamic_threshold:.2%}"
            elif leverage > self.config.max_leverage:
                reason = f"leverage {leverage} exceeds max {self.config.max_leverage}"
            elif is_trending_down:
                reason = "deteriorating margin trend detected"

            self.logger.warning(
                f"CRITICAL: {event.symbol} {reason} (Vol Factor: {vol_factor:.2f})!"
            )
>>>>>>> 6c43e42 (feat(analytics): integrate Polars for high-performance trend detection and rolling risk stats)
            await self.publish(
                RiskVerdict(
                    status="CRITICAL",
                    margin=margin,
                    leverage=leverage,
                    symbol=event.symbol,
                    risk_rating=5,
                    account=event.account,
                )
            )
<<<<<<< HEAD
=======
        else:
            stats = analytics.get_rolling_stats(event.symbol)
            avg_margin = stats.get("avg_margin", 0)
            self.logger.info(
                f"Position {event.symbol} safe. Margin: {margin:.2%}, Threshold: {dynamic_threshold:.2%}, Avg Margin: {avg_margin:.2%}"
            )
>>>>>>> 6c43e42 (feat(analytics): integrate Polars for high-performance trend detection and rolling risk stats)


# Instantiate singleton
engine = RiskEngine()
