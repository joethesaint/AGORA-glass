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

### 1. Ultra-Low Latency Execution (`src/services/circle_rescuer.py`)
*   **Circle Gateway Migration:** Transition from standard CCTP to **Circle Gateway** for instant (**<500ms**) cross-chain USDC movement. This is critical for meeting the sub-500ms rescue mandate in high-volatility scenarios.
*   **Unified Balance Integration:** Leverage Gateway's Unified Balance to allow users to fund rescues from any of the 11+ supported chains seamlessly.

### 2. Autonomous Agent Security (`src/services/circle_rescuer.py`)
*   **Circle Agent Stack:** Refactor internal wallet management to use **Agent Wallets** (`@circle-fin/cli`). This replaces manual private key handling with a secure, policy-driven MPC wallet specifically designed for AI agents.

### 3. "Agentic Economy" Standards (Solidity & Deploy)
*   **ERC-8004 Identity:** Register the AGORA sentinel as an official AI Agent on the Arc blockchain to establish on-chain reputation and verifiable identity.
*   **ERC-8183 Job Settlement:** Implement the "Job" standard for rescue operations, ensuring every intervention is treated as a settled on-chain task with verifiable deliverables.

### 4. Decimal Precision Audit (Arc-Specific)
*   **Dual-Decimal Safety:** Rigorously verify that Arc-native gas (**18 decimals**) and ERC-20 USDC (**6 decimals**) are never conflated in the `arc_pinner.py` or contract logic.

---

**Project Completion:** ~75% (Core Engine Live, Modern SDK Integration in Progress)
**Current Focus:** Migrating to Circle Gateway and implementing Agentic standards.
