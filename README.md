# Project GLASS: Gateway Liquidation Autonomous Safety Sentinel 🛡️

### 📖 Overview
Project GLASS is a high-autonomy AI agent acting as a **"Perp Safety Copilot"** for professional traders on decentralized perpetual exchanges. Designed to defy the "gravity" of market crashes, GLASS prevents liquidation cascades by continuously monitoring risk and executing autonomous, sub-second cross-chain collateral rescues. 

Instead of acting as a "black box" trading bot, GLASS introduces a **"Glass-Box" transparency model** (Reasoning-Traces as a Product). The agent is accountable for its decisions, emitting verifiable, on-chain reasoning traces for every action it takes.

### ⚠️ The Problem
1. **Liquidation Cascades:** Traders often face forced liquidations due to extreme leverage (retail averages ~60x). Research shows maintaining a tighter leverage band (3–5x) dramatically reduces margin-call risk, but 24/7 manual monitoring is impossible.
2. **Bridge Latency:** Cross-chain bridging can take hundreds of seconds, making it far too slow to "rescue" a position facing an immediate margin call.
3. **Opaque AI & Blind Copy-Trading:** "Smart copycats" can be profitable, but blindly copying bots without understanding their rationale is dangerous. There is a massive need for transparent, slashable accountability.

### 💡 The Solution & Architecture
GLASS solves the cross-chain liquidity gap by merging Python-based AI orchestration with the Circle and Arc technology stacks.

#### 1. Agent Layer (Arc Portfolio Sentinel & Perp Safety Copilot)
Built using a `TradingAgents`-style LLM framework, the agent continuously monitors funding rates, volatility, and margin levels. It enforces safe leverage bands and autonomously decides when to deleverage or move collateral across exchanges to prevent liquidations.

#### 2. Settlement Layer (Arc Blockchain)
GLASS leverages the **Arc Network**, Circle's EVM-compatible Layer-1 built specifically for stablecoin finance. 
* **Sub-Second Finality:** Arc's Malachite consensus engine delivers deterministic finality in under one second, ensuring rescue transactions settle instantly before a liquidation block hits.
* **USDC Gas Fees:** Arc uses USDC natively, making the agent's rescue budget predictable (~$0.01 per transaction) without exposing it to volatile gas tokens.

#### 3. Interoperability Layer (Arc Cross-Chain Inventory Router)
To achieve "antigravity" rescues, the agent uses **Circle Gateway** and CCTP to access a unified USDC balance. A custom cross-chain inventory router helps pre-position liquidity across EVMs to bypass standard bridge latency, ensuring emergency collateral arrives sub-500ms.

#### 4. Identity & Transparency Layer (Reasoning-Trace Dashboard)
GLASS is entirely transparent. The agent emits structured JSON "Reasoning-Traces" for every rescue or risk decision. These traces are hashed and stored on an **Attribution Registry on Arc**, creating a permanent, low-cost audit trail of *why* the AI took action. Users can rank "reasoning templates" by backtested PnL.

#### 5. Risk Layer (Leaderboard Risk Wrapper & Slash-Bonding)
The agent features "Skin in the Game." An on-chain "copy score" registry maintains a USDC performance bond on Arc. If the agent's reasoning diverges from its actions, or if risk metrics breach thresholds derived from RL risk-management, an oracle triggers a smart contract to automatically slash the bond and cut follower exposure.

### 🎯 Hackathon Focus (Agora Agents)
This project directly addresses the following tracks:
* **RFB 01 (Perpetual Futures Trading Agent):** 24/7 monitoring and autonomous liquidation protection.
* **RFB 06 (Social Trading Intelligence):** Providing verifiable "Reasoning-Traces" and slash-bonded copy-trading rather than blind execution.

---

### ⚙️ Environment Configuration

```json
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
