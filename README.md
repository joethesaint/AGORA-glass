# AGORA-glass: Glass-Box Sentinel 🛡️
> **Autonomous, Transparent Liquidation Protection for Perp Traders.**

AGORA-glass is a "Glass-Box" autonomous risk agent that prevents liquidation cascades for perpetual futures traders. It monitors leveraged positions 24/7, decides when a rescue is critical, and moves USDC across chains in under 500ms to save the position. Every decision is backed by a structured, cryptographically hashed reasoning trace pinned on-chain on Arc, making the agent's logic fully verifiable and trustless.

---

## 📖 Overview (Proof of Concept)
Project GLASS is designed to defy the catastrophic drops of market crashes. It prevents liquidation cascades by continuously monitoring risk and executing autonomous, sub-second cross-chain collateral rescues. 

Instead of acting as a "black box" trading bot, GLASS introduces a **"Glass-Box" transparency model** where the agent is accountable for its decisions, emitting verifiable, on-chain reasoning traces for every action it takes.

## ⚠️ The Problem

| Issue | Description |
|-------|-------------|
| **Liquidation Cascades** | Professional traders face immense liquidation risks due to crypto volatility, with retail leverage often reaching ~60x. Maintaining leverage between 3–5x significantly reduces margin-call risk, but manual 24/7 monitoring is impossible. |
| **Bridge Latency** | Current cross-chain bridging solutions can take hundreds of seconds, which is far too slow to "rescue" a position facing an immediate margin call. |
| **Opaque AI & Expensive Gas** | Existing automated bots provide no justification for their risk decisions. Frequent risk-balancing on traditional Layer-1s is uneconomical due to volatile gas token prices. |

## 💡 The Solution & Architecture
GLASS solves the cross-chain liquidity gap by merging Python-based AI orchestration with the Circle and Arc technology stacks.

### 1. Agent Layer (Python / TradingAgents)
Built using the Python-based `TradingAgents` framework, the agent continuously monitors funding rates, volatility, and margin levels. It enforces safe leverage bands (3-5x) and autonomously decides when to deleverage or move collateral. 

### 2. Settlement & Safety Layer (Arc Blockchain)
GLASS leverages the **Arc Network**, an EVM-compatible Layer-1 built by Circle specifically for stablecoin finance. 
* **Sub-Second Finality:** Arc's Malachite consensus engine delivers deterministic finality in under one second (~780 milliseconds), ensuring rescue transactions settle instantly and irreversibly before a liquidation block hits.
* **USDC Gas Fees:** Arc uses USDC as its native gas token, meaning the agent's rescue budget is predictable (~$0.01 per transaction) and immune to the sudden cost spikes seen on chains using volatile tokens like ETH.

### 3. Interoperability Layer (Circle Gateway & CCTP)
To achieve seamless cross-chain rescues, the agent uses **Circle Gateway** to access a unified USDC balance across multiple chains. This enables sub-500ms cross-chain transfers, ensuring that emergency collateral arrives exactly when and where it is needed. The agent executes these actions autonomously using **Circle Developer-Controlled Wallets**.

### 4. Identity & Transparency Layer (The "Glass-Box" Twist)
To fulfill the requirements of Social Trading Intelligence, GLASS is entirely transparent. The agent emits structured JSON "Reasoning-Traces" for every rescue or risk decision. These traces are hashed and pinned to an **Attribution Registry on Arc**, creating a permanent, low-cost (cents per transaction) audit trail of *why* the AI took action. 

### 5. Risk Layer (Slash-Bonding)
The agent features "Skin in the Game." The creator posts a USDC performance bond on Arc. If the agent's reasoning diverges from its actions, or if it breaches hardcoded safety bands (e.g., exceeding 5x leverage), an oracle triggers the smart contract to automatically slash the bond.

---

## 🎯 Hackathon Focus
This PoC is being developed for the **Agora Agents Hackathon** (hosted by Canteen and Circle). It directly addresses:

- **RFB 01 (Perpetual Futures Trading Agent):** 24/7 monitoring and autonomous liquidation protection.
- **RFB 06 (Social Trading Intelligence):** Providing verifiable, accountable AI logic rather than blind copy-trading.

### 🚀 Hackathon Strategy (Agora x Circle)

| Judging Criterion (weight) | How AGORA-glass Scores |
|---------------------------|------------------------|
| **Agentic Sophistication** (30%) | Fully autonomous loop: monitor → assess → decide → execute → log. No human intervention. |
| **Traction** (30%) | Real-world utility for perp traders. Onboarding test users during the hackathon to show live rescues and volume. |
| **Circle Platform Utilization** (20%) | Deep integration: Arc testnet (settlement), Circle Gateway (cross-chain), Dev-Controlled Wallets, and Circle App Kit. |
| **Innovation** (20%) | "Glass-Box" identity—combining verifiable decision-making (RFB 06) with autonomous perp safety (RFB 01). |

---

## 🏗️ System Architecture

AGORA-glass utilizes a decoupled architecture where an off-chain Python agent orchestrates risk assessment, while the Arc blockchain provides a trustless settlement layer.

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

---

## 👥 Team Roles & Coordination

| Role | Lead | Primary Responsibilities | Stack |
| :--- | :--- | :--- | :--- |
| **Agent Architect** | **Joe** | PerpMonitor, RiskEngine, ReasoningTracer, MessageBus, WS Bridge. | Python, asyncio, web3.py |
| **On-chain Engineer** | **Ayo** | `AttributionRegistry.sol`, `Vault.sol`, deployment, ABIs. | Solidity, Foundry/Hardhat |
| **Full-stack/UX** | **Andy** | Next.js Dashboard, WS Client, App Kit Integration, Fund Vault UI. | TS, React, viem/ethers |
| **DevRel / Narrator** | **Lani** | Storytelling, Pitch, Traction updates, User onboarding, Demo. | Arc CLI, Storytelling |

---

## 📅 Build Flow (2-Week Sprint)

### Week 1: Core Loop & Contracts
| Day | Joe (Agent) | Ayo (On-chain) | Andy (Frontend) | Lani (DevRel) |
|:---|:---|:---|:---|:---|
| **D1** | Scaffold MessageBus & Monitor | Deploy `AttributionRegistry` | Scaffold Next.js & Wallet Connect | `update product`, Storyboard |
| **D2** | Hyperliquid Data Integration | Deploy `Vault` (Agent-Gated) | Build Health Cards (Mock Data) | Pitch structure, Teaser video |
| **D3** | RiskEngine & ReasoningTracer | Wire Vault Auth to Joe's Addr | Build "Reasoning Trace" Feed | Community feedback, Discord |
| **D4** | RescueDispatcher (Mock GW) | Verify Contracts on Arcscan | WebSocket Live Connection | Live-demo script, Fail-over plan |
| **D5** | Integration: Real Arc Txns | Finalize ABIs & Event Specs | Build "Fund Vault" UI | Rehearse demo, Backup video |
| **D6** | Hardening & Env Config | Code review & Gas report | Polish UI & Responsiveness | Finalize script & Story |
| **D7** | **Integration Milestone** | **Contract Freeze** | **MVP Dashboard Live** | `update traction` (Early metrics) |

### Week 2: Polish & Traction
- **D8-9:** Optimize scheduling (Joe) / User onboarding flow (Andy) / 3-5 Test Users (Lani).
- **D10:** Real-data dry run (Joe) / "Total Rescued" Tracker (Andy) / 2-min Demo Recording (Lani).
- **D11-14:** Bug fixes, Final Integration, Ship to Luma/Hackathon portal.

---

### 🛠️ Development Tools
This project uses **ARC-cli** (`arc-canteen`) for tracking progress and interacting with the Arc network.
- **Status:** `arc-canteen status`
- **Traction Updates:** `arc-canteen update-traction`
- **Product Updates:** `arc-canteen update-product`
- **Context/Docs:** `arc-canteen context`

See [HACKATHON.md](./HACKATHON.md) for full installation and usage details.

```mcp
{
  "mcpServers": {
    "notebooklm": {
      "command": "npx",
      "args": [
        "-y",
        "@roomi-fields/notebooklm-mcp"
      ]
    }
  }
}

```

---
*Maintained by the AGORA-glass Team.*
