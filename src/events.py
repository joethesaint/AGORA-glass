from dataclasses import dataclass, field
from typing import List, Dict, Any
from datetime import datetime


@dataclass(frozen=True)
class BaseEvent:
    """Base class for all AGORA-glass events.

    Attributes:
        timestamp (float): The Unix timestamp when the event was created.
    """

    timestamp: float = field(
        default_factory=lambda: datetime.now().timestamp(), kw_only=True
    )


@dataclass(frozen=True)
class PositionUpdate(BaseEvent):
    """Event representing a position update from an exchange.

    Attributes:
        symbol (str): The asset symbol (e.g., BTC-PERP).
        margin_ratio (float): The current margin ratio (0.0 to 1.0).
        leverage (float): The current leverage (e.g., 5.0).
        account (str): The account address or identifier.
    """

    symbol: str
    margin_ratio: float
    leverage: float
    account: str = "0xDEFAULT"


@dataclass(frozen=True)
class MarketVolatilityUpdate(BaseEvent):
    symbol: str
    volatility_factor: float  # Normalized 0.0 to 1.0

@dataclass(frozen=True)
class RiskVerdict(BaseEvent):
    """Event representing the result of a risk evaluation.

    Attributes:
        status (str): The risk status (SAFE, WARNING, CRITICAL).
        margin (float): The margin ratio at the time of evaluation.
        leverage (float): The leverage at the time of evaluation.
        symbol (str): The asset symbol.
        risk_rating (int): A numeric risk rating (1-5).
        account (str): The account address.
    """

    status: str
    margin: float
    leverage: float
    symbol: str
    risk_rating: int
    account: str = "0xDEFAULT"


@dataclass(frozen=True)
class ReasoningTrace(BaseEvent):
    """Event representing the hashed reasoning pinned to the Arc network.

    Attributes:
        agent_id (str): The identifier of the agent that generated the trace.
        action (str): The action taken (e.g., RESCUE_INITIATED).
        account (str): The account address.
        leverage_before (float): The leverage before the rescue action.
        margin_ratio (float): The margin ratio that triggered the trace.
        rescue_amount_usdc (float): The amount of USDC requested for rescue.
        evidence (List[str]): Supporting evidence for the decision.
        risk_rating (str): The risk rating string.
        reason_hash (str): The hex string hash of the reasoning text.
        reasoning_text (str): The full text explanation of the decision.
    """

    agent_id: str
    action: str
    account: str
    leverage_before: float
    margin_ratio: float
    rescue_amount_usdc: float
    evidence: List[str]
    risk_rating: str
    reason_hash: str
    reasoning_text: str


@dataclass(frozen=True)
class RescueInitiated(BaseEvent):
    """Event representing the initiation of a rescue operation.

    Attributes:
        reason_hash (str): The hash of the reasoning trace for this rescue.
        amount (float): The amount of USDC being moved.
        target_chain (str): The blockchain name (e.g., Arc_Testnet).
    """

    reason_hash: str
    amount: float
    target_chain: str


@dataclass(frozen=True)
class RescueComplete(BaseEvent):
    """Event representing the completion of a rescue operation.

    Attributes:
        status (str): The result status (SUCCESS, FAILED).
        tx_hash (str): The transaction hash of the rescue action.
        amount (float): The final amount moved.
        reason_hash (str): The hash of the reasoning trace that triggered this rescue.
        latency_ms (float): The time taken for the rescue cycle in milliseconds.
    """

    status: str
    tx_hash: str
    amount: float
    reason_hash: str
    latency_ms: float


@dataclass(frozen=True)
class SystemError(BaseEvent):
    """Event representing an internal system error.

    Attributes:
        module (str): The name of the module where the error occurred.
        message (str): A descriptive error message.
        error_type (str): The class name of the exception.
    """

    module: str
    message: str
    error_type: str


@dataclass(frozen=True)
class WSSignal(BaseEvent):
    """Payload for the frontend WebSocket bridge.

    Attributes:
        event_type (str): The type of event being signaled.
        payload (Dict[str, Any]): The structured data for the frontend.
    """

    event_type: str
    payload: Dict[str, Any]
