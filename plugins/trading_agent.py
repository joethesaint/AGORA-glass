import asyncio
import random
from src.base import BaseComponent
from src.events import PositionUpdate, RiskVerdict, ReasoningTrace

class TradingAgent(BaseComponent):
    """
    Comparative agent (agora-glass-02) that implements a different 
    risk-taking strategy to provide a baseline for the Sentinel (agora-glass-01).
    """
    def __init__(self):
        super().__init__("TradingAgent")
        self.agent_id = "agora-glass-02"
        # Subscribe to market updates
        self.subscribe(PositionUpdate, self.on_position)

    async def on_position(self, event: PositionUpdate):
        # Comparative Logic: Aggressive rebalancing strategy
        # If margin is low, take proactive action (unlike Sentinel's reactive rescue)
        if event.margin_ratio < 0.20:
            self.logger.info(
                f"Proactive Rebalancing: {event.symbol} margin at {(event.margin_ratio*100):.2f}%",
                agent_id=self.agent_id
            )
            
            # Emit a mock reasoning trace for comparative auditing
            reasoning = {
                "strategy": "Aggressive Rebalancing",
                "reason": f"Margin {event.margin_ratio:.2f} is below 0.20 threshold.",
                "action": "DELEVERAGE"
            }
            await self.publish(ReasoningTrace(
                agent_id=self.agent_id,
                action="DELEVERAGE",
                account=event.account,
                leverage_before=event.leverage,
                margin_ratio=event.margin_ratio,
                rescue_amount_usdc=0,
                evidence=[f"Margin {event.margin_ratio:.2f} < 0.20"],
                risk_rating="MEDIUM",
                reason_hash=f"0x{random.getrandbits(256):064x}",
                reasoning_text=reasoning
            ))
