# AGORA-glass: Gap Analysis & Road to MVP

Based on the review of the `dev_joe` branch objectives, the `src/` codebase, and the architectural blueprints, here is the analysis of what remains to be built to achieve the "Glass-Box Liquidation Protector" MVP.

## 📋 Status vs. Target Architecture

| Component | Status | Remaining Work |
| :--- | :--- | :--- |
| **Message Bus & Events** | ✅ Implemented | Stable foundation in `src/bus.py` and `src/events.py`. |
| **Risk Engine** | ⚠️ Scaffolded | `src/engine.py` has logic but uses hardcoded thresholds. Needs volatility integration. |
| **Perp Monitor** | ⚠️ Partially Live | `src/monitor.py` has Hyperliquid logic but needs WebSocket stabilization. |
| **Reasoning Tracer** | ⚠️ Scaffolded | `src/tracer.py` creates traces. Hashing logic is deterministic. |
| **Rescue Dispatcher** | ✅ Implemented | `src/dispatcher.py` now utilizes live SDKs for Arc and Circle. |
| **Smart Contracts** | 🏗️ Under Construction | **[Antigravity Agent]** Working on `AttributionRegistry` and `Vault` live deployment & ABI sync. |

---

## 🚀 Critical Path: What is Left to Build

### 1. Live Monitoring Layer (`src/monitor.py`)
*   **Hyperliquid Integration:** Switch from `mode="mock"` to a real WebSocket connection to Hyperliquid.
*   **Data Normalization:** Map Hyperliquid's raw `marginRatio` and `leverage` responses into the project's internal `PositionUpdate` event.

### 2. The "Glass-Box" On-Chain Registry (Solidity)
*   **AttributionRegistry.sol:** Implementation of the registry on Arc Testnet to store `reasonHash`.
*   **Vault.sol:** The actual USDC holding contract that will release funds only when the agent signs a rescue transaction.
*   **Deployment Script:** A workflow to deploy these to Arc (Chain ID 5042002).

### 3. Financial Execution Layer (`src/dispatcher.py`)
*   **Circle Gateway Integration:** Implement the `execute_circle_rescue` function using the Circle SDK to move USDC from the Arc Vault to the trader's account.
*   **Arc Pinning:** Implement the `pin_to_arc` function to send the `reasonHash` to the `AttributionRegistry`.

### 4. The Dashboard (Frontend)
*   **Next.js Implementation:** Visualize live margin levels, real-time "Reasoning Traces," and Rescue History with Arcscan links.

---

## 🛠️ Strategic Use of Context
I will utilize the following documentation from `_sources/` to complete these tasks:
*   **Arc Network & Build on Arc:** For sub-second finality deployment patterns.
*   **Circle Gateway vs CCTP:** To implement the preferred <500ms rescue route.
*   **Agent Stack Docs:** For utilizing Circle Developer-Controlled Wallets.

**Project Completion:** ~30% (Technical Skeleton)
**Current Focus:** Moving from "Mock" to "Live" integrations.
