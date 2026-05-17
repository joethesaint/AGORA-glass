from src.base import BaseComponent
from src.events import PositionUpdate, RiskVerdict
from src.errors import safe_handler


class RiskEngine(BaseComponent):
    """
    Risk evaluation engine based on Cheng et al. (2021) safety bands.
    Enforces a 12% critical margin ratio and 5x maximum leverage.
    """

    MAX_LEVERAGE = 5.0
    RESCUE_TARGET_MARGIN = 0.25
    CRITICAL_THRESHOLD = 0.12

    def __init__(self):
        super().__init__("RiskEngine")
        self.subscribe(PositionUpdate, self.on_position_update)

    @safe_handler("RiskEngine")
    async def on_position_update(self, event: PositionUpdate):
        # Risk grounding: Cheng et al. (2021) 12% margin ratio safety band
        margin = event.margin_ratio
        leverage = event.leverage

        is_critical = margin < self.CRITICAL_THRESHOLD or leverage > self.MAX_LEVERAGE

        if is_critical:
            reason = (
                "margin below threshold"
                if margin < self.CRITICAL_THRESHOLD
                else "leverage exceeds max"
            )
            self.logger.warning(
                f"CRITICAL: {event.symbol} {reason} (Margin: {margin:.2%}, Leverage: {leverage}x)!"
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
            self.logger.info(f"Position {event.symbol} is safe (Margin: {margin:.2%}, Leverage: {leverage}x).")


# Instantiate singleton
engine = RiskEngine()
