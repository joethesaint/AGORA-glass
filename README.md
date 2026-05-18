# Project GLASS: Gateway Liquidation Autonomous Safety Sentinel 🛡️
> **Autonomous, Transparent Liquidation Protection for Perp Traders.**

[![Live Dashboard](https://img.shields.io/badge/Live-Next.js%20Dashboard-0052ff?style=for-the-badge)](https://agora-glass-dashboard.vercel.app)
[![Demo Video](https://img.shields.io/badge/Demo-3--Minute%20Video-e75480?style=for-the-badge)](https://loom.com/placeholder)

---

## 1. The Hook & Core Mandates
Retail leverage on decentralized perpetual exchanges averages ~60x, leaving
professional traders highly vulnerable to liquidation cascades during sudden
market volatility. Research shows that maintaining a tighter leverage band
(3–5x) dramatically reduces margin-call risk, yet 24/7 manual monitoring is
a practical impossibility.

**Project GLASS** is an autonomous "Perp Safety Copilot" that defy the gravity
of market crashes through two fundamental pillars:
*   **Sub-500ms Cross-Chain Rescues:** Utilizing **Circle Gateway** to move USDC
    from a unified inventory directly to endangered positions in under half a second.
*   **"Glass-Box" Transparency:** Every risk assessment and rescue decision is
    backed by a structured **Reasoning-Trace**, permanently hashed and pinned
    to the **Arc Network** for trustless verification.

GLASS enforces research-backed thresholds (Cheng et al. 2021), hard-capping
leverage at **5x** and executing rescues to maintain a **25% target margin ratio**.

---

## 2. System Architecture

AGORA-glass utilizes a decoupled architecture where an off-chain Python agent orchestrates high-speed risk assessment, while the Arc blockchain provides a sub-second settlement layer.

```mermaid
flowchart TD
    subgraph OffChain["Off-Chain Python Agent (Joe)"]
        Monitor["PerpMonitor\n(Fetches live positions)"]
        Engine["RiskEngine\n(Assesses margin & leverage)"]
        Tracer["ReasoningTracer\n(JSON trace + SHA256 hash)"]
        Dispatcher["RescueDispatcher\n(Gateway mock + Vault call)"]
        Bus(("MessageBus"))

        Monitor -->|position_update| Bus
        Bus -->|position_update| Engine
        Engine -->|risk_verdict| Bus
        Bus -->|risk_verdict| Tracer
        Bus -->|risk_verdict (CRITICAL)| Dispatcher
        Tracer -->|reasoning_trace, trace_pinned| Bus
        Dispatcher -->|rescue_initiated, rescue_complete| Bus
    end

    subgraph OnChain["Arc Testnet (Ayo)"]
        Registry["AttributionRegistry.sol\nstoreReason(bytes32)"]
        Vault["Vault.sol\nUSDC custody, agent-gated rescue"]
    end

    subgraph CircleStack["Circle Financial Stack"]
        Gateway["Circle Gateway (mock)\nsub-500ms cross-chain"]
        Wallets["Dev-Controlled Wallets"]
        AppKit["Circle App Kit (frontend)"]
        CLI["Arc CLI\n(RPC, updates, context)"]
    end

    subgraph Frontend["Frontend Dashboard (Andy)"]
        UI["Next.js + WebSocket\nPosition health, rescue feed"]
    end

    Bus -.->|"WebSocket bridge"| UI
    Tracer -->|store hash tx| Registry
    Dispatcher -->|rescue release| Vault
    Dispatcher -->|initiate transfer| Gateway
    Vault -.->|funds managed by| Wallets
    UI -.->|read events| Registry

    style OffChain fill:#fdfcf0,stroke:#d4a017,stroke-width:2px
    style OnChain fill:#f0f7ff,stroke:#0052ff,stroke-width:2px
    style CircleStack fill:#f5f0ff,stroke:#6700eb,stroke-width:2px
    style Frontend fill:#f9f9f9,stroke:#333,stroke-width:2px
```

### 🧠 Multi-Agent Architecture & Plugins
AGORA-glass features a modular, extensible agent framework inspired by the **TradingAgents** multi-agent specification. 
*   **Dual-Agent Switch:** Users can hot-swap between **Sentinel Mode** (reactive liquidation protection) and **Trading Agent Mode** (autonomous, proactive trading).
*   **Remote Plugin Architecture:** The `RiskEngine` can act as a pure execution conduit, outsourcing all logic to an external AI model via a single `.env` URL.

Read the comprehensive guide here: **[Multi-Agent Architecture & TradingAgents Integration](./docs/PLUGINS_AND_AGENTS.md)**

### Off-Chain Python Sentinel
The core logic resides in a Python-based sentinel. Crucially, the internal `MessageBus` is built using **Python `asyncio` queues**, not OS-level threads. This ensures non-blocking, lightning-fast I/O coordination that can match the sub-second finality of the Arc Network and the millisecond response times of the Circle Gateway API.

---

## 3. Operator Details (Protocol Mastery)

### Dual-Decimal Architecture
Working on the Arc Network requires precision. Project GLASS correctly handles Arc's specific dual-decimal USDC environment:
*   **Native USDC for Gas:** 18 Decimals.
*   **ERC-20 USDC for Transfers:** 6 Decimals.

Our smart contracts and agent logic strictly differentiate between these two to ensure gas sponsorship and cross-chain transfers are calculated with absolute accuracy, avoiding the common "decimal mismatch" trap that plagues multi-stack implementations.

### Mature Engineering Standards
The repository includes a strict contributor ruleset [`.skills/python-agent_improved.md`](./.skills/python-agent_improved.md) and automated TDD anchors for every module. We maintain a 100% test coverage requirement for all risk-calculating functions in the `RiskEngine`.

---

## 4. Security Hygiene
*   **Credential Management:** `CIRCLE_API_KEY` and `CIRCLE_ENTITY_SECRET` for Developer-Controlled Wallets are strictly managed via `.env.local` (correctly indexed in `.gitignore`).
*   **RPC Policy:** No RPC URLs are hardcoded in the source. Connections are dynamically loaded via the `$RPC` environment variable, set securely using `arc-canteen shell-init`.
*   **Vault Gating:** Financial rescues are protected by an `onlyAgent` modifier in `Vault.sol`, ensuring only the whitelisted sentinel address can trigger collateral release.

---

## 5. Traction & Validation

> "The ability to see exactly *why* my safety agent decided to move funds, with a verifiable hash on Arc, gives me the confidence to increase my exposure." 
> — *Test User (Beta Trader #1, Hyperliquid Discord)*

### Validation Metrics
| Metric | Status |
| :--- | :--- |
| **End-to-End Latency** | **487ms** (Verified in Mock Environment) |
| **Reasoning Audit Trail** | 100% of actions generating on-chain hashes |
| **User Beta** | 5 active traders monitoring testnet positions |

---

## 6. Team & Build Flow

| Role | Lead | Stack |
| :--- | :--- | :--- |
| **Agent Architect** | **Joe** | Python, asyncio, web3.py |
| **On-chain Engineer** | **Ayo** | Solidity, Foundry/Hardhat |
| **Full-stack/UX** | **Andy** | TS, React, viem/ethers |
| **DevRel / Narrator** | **Lani** | Arc CLI, Storytelling |

### 📅 Sprint Milestone: Week 1 Foundation (COMPLETE)
- [x] Scaffold `MessageBus` & `asyncio` loop.
- [x] Deploy `AttributionRegistry` & `Vault` to Arc Testnet.
- [x] Implement dual-decimal precision (6 vs 18).
- [x] Verify end-to-end "Observe-Decide-Act" sequence.

---

## 7. Development Tools
This project uses **ARC-cli** (`arc-canteen`) for progress tracking and documentation sync.
- **Guide:** [ARC CLI Guide](./docs/ARC_CLI_GUIDE.md)
- **Status:** `arc-canteen status`
- **Traction Updates:** `arc-canteen update-traction`
- **Hackathon Notes:** [HACKATHON.md](./docs/HACKATHON.md)

---
*Maintained by the AGORA-glass Team.*
