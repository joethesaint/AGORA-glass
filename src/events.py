from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any
from datetime import datetime

@dataclass(frozen=True)
class BaseEvent:
    """Base class for all AGORA-glass events."""
    # Move default arguments to kw_only to allow subclasses with positional args
    timestamp: float = field(default_factory=lambda: datetime.now().timestamp(), kw_only=True)

@dataclass(frozen=True)
class PositionUpdate(BaseEvent):
    symbol: str
    margin_ratio: float
    leverage: str
    account: str = "0xDEFAULT"

@dataclass(frozen=True)
class RiskVerdict(BaseEvent):
    status: str # SAFE, WARNING, CRITICAL
    margin: float
    symbol: str
    risk_rating: int # 1-5

@dataclass(frozen=True)
class ReasoningTrace(BaseEvent):
    agent_id: str
    action: str
    account: str
    leverage_before: str
    margin_ratio: float
    rescue_amount_usdc: float
    evidence: List[str]
    risk_rating: str
    reason_hash: str
    reasoning_text: str

@dataclass(frozen=True)
class RescueInitiated(BaseEvent):
    reason_hash: str
    amount: float
    target_chain: str

@dataclass(frozen=True)
class RescueComplete(BaseEvent):
    status: str
    tx_hash: str
    amount: float

@dataclass(frozen=True)
class SystemError(BaseEvent):
    module: str
    message: str
    error_type: str

@dataclass(frozen=True)
class WSSignal(BaseEvent):
    """Payload for the frontend WebSocket bridge."""
    event_type: str
    payload: Dict[str, Any]
