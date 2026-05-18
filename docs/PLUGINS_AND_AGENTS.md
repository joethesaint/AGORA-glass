# Multi-Agent Architecture & TradingAgents Integration

AGORA-glass is designed as a modular, high-speed execution layer for decentralized perpetual trading. While it ships with a default "Sentinel" behavior, its architecture is heavily inspired by the **TradingAgents** framework (from Tauric Research) and is built to be extensible.

This document explains the three ways agents operate within the AGORA-glass ecosystem.

---

## 1. The TradingAgents Framework (The Inspiration)
The original `TradingAgents` framework is a multi-agent LLM architecture that splits decision-making into distinct roles. AGORA-glass internalizes this pattern on its local high-speed event bus:

*   **Research Manager (`src/sentiment_agent.py`):** Analyzes market volatility to determine the current regime (e.g., RISK_ON or EXTREME_VOLATILITY).
*   **Portfolio Manager (`src/capital_agent.py`):** Determines optimal capital deployment or rescue amounts based on the total portfolio exposure.
*   **Trader / Sentinel (`src/engine.py`):** Makes the final execution call based on the inputs from the other agents and strict safety thresholds.

---

## 2. Remote Plugin Architecture (Bring Your Own Agent)
You do **not** need to rewrite the AGORA-glass codebase to use external AI models (like the upstream TradingAgents library, an Alpaca agent, or a custom DeepSeek-R1 model).

AGORA-glass features a **Remote Plugin Architecture**. It can act purely as a high-speed conduit (handling WebSockets, Arc pinning, and Circle DCW execution) while outsourcing the actual "thinking" to an external URL.

### How to use it:
1. Run your external AI Agent (e.g., the Python `TradingAgents` library) on a server or local port. It should accept a `POST /evaluate` endpoint.
2. In your AGORA-glass `.env` file, set the URL:
   ```env
   REMOTE_AGENT_URL=http://localhost:5000
   ```
3. Restart AGORA-glass. The internal `RiskEngine` will automatically switch to **REMOTE** mode. It will forward all live position and volatility data to your external agent, wait for a `CRITICAL` or `SAFE` response, and then execute the "Glass-Box" rescue cycle on Arc and Circle.

---

## 3. The Dual-Agent Switch (Sentinel vs. Trading Agent)
If you are using the built-in local logic, AGORA-glass supports two distinct operational modes that can be hot-swapped in real-time via the frontend dashboard:

*   **Sentinel Mode (Guardian):** The agent is strictly reactive. It monitors your external exchange account and does nothing until your margin drops below critical thresholds, at which point it injects USDC to prevent liquidation.
*   **Trading Agent Mode (Autonomous):** The agent becomes proactive. Mimicking the "Trader" role from the `TradingAgents` spec, it actively enters trades (`BUY`) when volatility is low and de-risks (`DE_RISK`) when volatility spikes, managing its own portfolio autonomously.

*Both modes maintain the core "Glass-Box" guarantee: Every decision is hashed and pinned to the Arc blockchain (ERC-8004/8183).*

---

## 4. Local Event Bus (Building Internal Agents)
If you prefer to build new agent logic directly inside the AGORA-glass repository, the architecture uses a central, type-safe `MessageBus` (`src/bus.py`). 

To add a new internal agent, you simply create a component and subscribe to the data streams you need:

```python
from src.base import BaseComponent
from src.events import PositionUpdate

class WhaleTrackerAgent(BaseComponent):
    def __init__(self):
        super().__init__("WhaleTracker")
        # Subscribe to all live position updates
        self.subscribe(PositionUpdate, self.on_position)

    async def on_position(self, event: PositionUpdate):
        # Your custom logic here...
        pass
```
There is no hardcoding required. The `MessageBus` handles the concurrent delivery of WebSocket data to all registered agents simultaneously.