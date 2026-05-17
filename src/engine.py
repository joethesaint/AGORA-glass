from src.base import BaseComponent
from src.events import PositionUpdate, RiskVerdict, MarketVolatilityUpdate
from src.errors import safe_handler
from src.config import settings


class RiskEngine(BaseComponent):
    """
    Risk evaluation engine based on Cheng et al. (2021) safety bands.
    Uses dynamic thresholds adjusted by live market volatility.
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
        Evaluate risk using dynamic thresholds:
        Threshold = Base_Threshold + (Volatility_Factor * Multiplier)
        """
        margin = event.margin_ratio
        leverage = event.leverage
        
        # Get volatility for this symbol, default to 0.5 (medium) if unknown
        vol_factor = self.volatility_state.get(event.symbol, 0.5)
        
        # Calculate dynamic threshold
        dynamic_threshold = self.config.base_critical_threshold + (
            vol_factor * self.config.volatility_multiplier
        )

        is_critical = margin < dynamic_threshold or leverage > self.config.max_leverage

        if is_critical:
            reason = (
                f"margin {margin:.2%} below dynamic threshold {dynamic_threshold:.2%}"
                if margin < dynamic_threshold
                else f"leverage {leverage} exceeds max {self.config.max_leverage}"
            )
            self.logger.warning(
                f"CRITICAL: {event.symbol} {reason} (Vol Factor: {vol_factor:.2f})!"
            )
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
        else:
            self.logger.info(
                f"Position {event.symbol} is safe (Margin: {margin:.2%}, Threshold: {dynamic_threshold:.2%})"
            )


# Instantiate singleton
engine = RiskEngine()
