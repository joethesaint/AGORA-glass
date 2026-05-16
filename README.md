# Project GLASS: Gateway Liquidation Autonomous Safety Sentinel 🛡️
**(Internal Codename: Antigravity)**

### 📖 Overview (Proof of Concept)
Project GLASS is a high-autonomy AI agent acting as a "Perp Safety Copilot" for professional traders on decentralized perpetual exchanges (like Hyperliquid and dYdX). Designed to defy the "gravity" of market crashes, GLASS prevents liquidation cascades by continuously monitoring risk and executing autonomous, sub-second cross-chain collateral rescues. 

Instead of acting as a "black box" trading bot, GLASS introduces a **"Glass-Box" transparency model** where the agent is accountable for its decisions, emitting verifiable, on-chain reasoning traces for every action it takes.

### ⚠️ The Problem
1. **Liquidation Cascades:** Professional traders face immense liquidation risks due to crypto volatility, with retail leverage often reaching ~60x. Research shows that maintaining leverage between 3–5x significantly reduces margin-call risk, but manual 24/7 monitoring is impossible.
2. **Bridge Latency:** Current cross-chain bridging solutions can take hundreds of seconds, which is far too slow to "rescue" a position facing an immediate margin call.
3. **Opaque AI & Expensive Gas:** Existing automated trading bots provide no justification for their risk decisions. Furthermore, frequent risk-balancing on traditional Layer-1 blockchains is uneconomical due to volatile gas token prices.

### 💡 The Solution & Architecture
GLASS solves the cross-chain liquidity gap by merging Python-based AI orchestration with the Circle and Arc technology stacks.

#### 1. Agent Layer (Python / TradingAgents)
Built using the Python-based `TradingAgents` framework, the agent continuously monitors funding rates, volatility, and margin levels. It enforces safe leverage bands (3-5x) and autonomously decides when to deleverage or move collateral. 

#### 2. Settlement & Safety Layer (Arc Blockchain)
GLASS leverages the **Arc Network**, an EVM-compatible Layer-1 built by Circle specifically for stablecoin finance. 
* **Sub-Second Finality:** Arc's Malachite consensus engine delivers deterministic finality in under one second (~780 milliseconds), ensuring rescue transactions settle instantly and irreversibly before a liquidation block hits.
* **USDC Gas Fees:** Arc uses USDC as its native gas token, meaning the agent's rescue budget is predictable (~$0.01 per transaction) and immune to the sudden cost spikes seen on chains using volatile tokens like ETH.

#### 3. Interoperability Layer (Circle Gateway & CCTP)
To achieve "antigravity" rescues, the agent uses **Circle Gateway** to access a unified USDC balance across multiple chains. This enables sub-500ms cross-chain transfers, ensuring that emergency collateral arrives exactly when and where it is needed. The agent executes these actions autonomously using **Circle Developer-Controlled Wallets**.

#### 4. Identity & Transparency Layer (The "Glass-Box" Twist)
To fulfill the requirements of Social Trading Intelligence, GLASS is entirely transparent. The agent emits structured JSON "Reasoning-Traces" for every rescue or risk decision. These traces are hashed and pinned to an **Attribution Registry on Arc**, creating a permanent, low-cost (cents per transaction) audit trail of *why* the AI took action. 

#### 5. Risk Layer (Slash-Bonding)
The agent features "Skin in the Game." The creator posts a USDC performance bond on Arc. If the agent's reasoning diverges from its actions, or if it breaches hardcoded safety bands (e.g., exceeding 5x leverage), an oracle triggers the smart contract to automatically slash the bond.

### 🎯 Hackathon Focus
This PoC is being developed for the **Agora Agents Hackathon** (hosted by Canteen and Circle). It directly addresses:
* **RFB 01 (Perpetual Futures Trading Agent):** 24/7 monitoring and autonomous liquidation protection.
* **RFB 06 (Social Trading Intelligence):** Providing verifiable, accountable AI logic rather than blind copy-trading.
