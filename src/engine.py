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


# Instantiate singleton
engine = RiskEngine()
