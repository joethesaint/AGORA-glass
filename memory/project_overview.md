---
name: project-overview
description: AGORA-glass — autonomous liquidation protection sentinel for perp traders, combining Python agent + Arc smart contracts + Circle Gateway
metadata:
  type: project
---

AGORA-glass (Gateway Liquidation Autonomous Safety Sentinel) is a hackathon project that protects retail leverage traders on DeFi perpetual exchanges from liquidation cascades.

**Core mechanic:** An off-chain Python asyncio agent (Sentinel) monitors positions, runs a RiskEngine, and executes sub-500ms cross-chain USDC rescues via Circle Gateway. Every decision is hashed and stored on Arc Testnet for trustless "Glass-Box" verification.

**Why:** Research (Cheng et al. 2021) shows 3–5x leverage bands dramatically reduce margin-call risk, but 24/7 manual monitoring is impractical. GLASS automates it.

**Thresholds:** Hard-cap leverage at 5x; rescue to maintain 25% target margin ratio.

**Stack:**
- Off-chain: Python agent (asyncio MessageBus, RiskEngine, ReasoningTracer, RescueDispatcher)
- On-chain: Arc Testnet (chainId 5042002), Solidity ^0.8.24, Foundry + Hardhat
- Circle: Gateway (mock) for cross-chain USDC, Dev-Controlled Wallets
- Frontend: Next.js + WebSocket, live at agora-glass-dashboard.vercel.app

**Team:**
- Joe — Python agent architect
- Ayo — on-chain engineer (Solidity, Foundry/Hardhat)
- Andy — full-stack/UX (TS, React, viem/ethers)
- Lani — DevRel/Narrator (Arc CLI)

**Arc Testnet details:**
- RPC: dynamically loaded via `$RPC` env var; fallback in hardhat.config.ts (has API key embedded — see security note)
- USDC on Arc: `0x3600000000000000000000000000000000000000` (ERC-20, 6 decimals)
- Native USDC for gas: 18 decimals (dual-decimal architecture)
- Block explorer: arcscan.app

**How to apply:** When suggesting changes, keep Arc's dual-decimal system in mind, and remember the agent wallet is the bridge between Vault funds and Circle Gateway.
