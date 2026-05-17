# AGORA-glass: Gap Analysis & Road to MVP

Based on the review of the `dev_joe` branch objectives, the `src/` codebase, and the architectural blueprints, here is the analysis of what remains to be built to achieve the "Glass-Box Liquidation Protector" MVP.

## 📋 Status vs. Target Architecture

| Component | Status | Remaining Work |
| :--- | :--- | :--- |
| **Message Bus & Events** | ✅ Implemented | Stable foundation in `src/bus.py` and `src/events.py`. |
| **Risk Engine** | ✅ Integrated | Dynamic thresholds implemented based on live market volatility (numpy). |
| **Perp Monitor** | ✅ Live Ready | Real-time monitoring and volatility tracking via Hyperliquid SDK. |
| **Reasoning Tracer** | ⚠️ Scaffolded | `src/tracer.py` creates traces. Hashing logic is deterministic. |
| **Rescue Dispatcher** | ✅ Implemented | `src/dispatcher.py` now utilizes live SDKs for Arc and Circle. |
| **Smart Contracts** | ✅ Infrastructure Ready | Hardhat setup, deployment scripts, and unit tests complete. |

---

## 🚀 Critical Path: What is Left to Build

### 1. Live Monitoring Layer (`src/monitor.py`)
*   **Hyperliquid Integration:** Switch from `mode="mock"` to a real WebSocket connection to Hyperliquid. (Currently in progress by Market Monitor sub-tasks).

### 2. The "Glass-Box" On-Chain Registry (Solidity)
*   **Finalization:** Ayo to finalize logic in `AttributionRegistry.sol` and `Vault.sol`.
*   **Deployment:** Live deployment to Arc (Chain ID 5042002) once RPC session is refreshed.

### 3. Financial Execution Layer (`src/dispatcher.py`)
*   **Integration:** Connection between `CircleRescuer` and the live `Vault` address.

### 4. The Dashboard (Frontend)
*   **Next.js Implementation:** Andy to visualize live margin levels and reasoning traces.

---

**Project Completion:** ~60% (Core Engine & Data Feeds Live)
**Current Focus:** Finalizing Smart Contract Business Logic & Frontend Dashboard.
