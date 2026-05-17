# Consolidated Build‑Time Framework: AGORA‑glass

This framework defines the standards for TDD, brand alignment, research grounding via NotebookLM, and SDK utilization to maximize hackathon judging impact.

---

## 1. TDD Anchors for Every Module

Every module ships with a test *before* any implementation.

| Module | Test Framework | Initial Validation Goal |
|--------|---------------|-------------------------|
| `PerpMonitor` | `pytest` | Does `fetch_positions()` correctly parse mock Hyperliquid responses? |
| `RiskEngine` | `pytest` | Does it trigger `CRITICAL` at margin-ratio < 0.12 and target 0.25? |
| `ReasoningTracer` | `pytest` | Does it produce valid, hashed JSON reasoning traces? |
| `RescueDispatcher` | `pytest` | Does it call the Gateway mock and confirm in < 500ms? |
| `AttributionRegistry.sol` | Hardhat/Foundry | Does `storeReason` emit the correct `ReasonHashStored` event? |
| `Vault.sol` | Hardhat/Foundry | Is `releaseForRescue` correctly gated by the `onlyAgent` modifier? |
| `Frontend` | Vitest/Jest | Does `PositionCard` render the correct status based on risk levels? |

---

## 2. GLASS Brand Alignment

| Letter | Word | Strategic Implementation | Demo Highlight |
|--------|------|--------------------------|---------------|
| **G** | Gateway | Circle Gateway for cross-chain USDC transfers | Sub-500ms rescue completion |
| **L** | Liquidation | Autonomous monitoring & rescue triggering | Dashboard "CRITICAL" state transition |
| **A** | Autonomous | 24/7 loop with self-auditing reasoning traces | Async monitoring & evidence generation |
| **S** | Safety | Cheng et al. (2021) 5x leverage & 25% target | Citation-backed risk decisions |
| **S** | Sentinel | On-chain reasoning identity pinned to Arc | Verifiable hash on Arcscan |

---

## 3. NotebookLM: The Context Oracle

### 3a. Research Knowledge Base
Upload core papers (`TradingAgents`, `Trading-R1`), Circle/Arc docs, and risk research to a dedicated NotebookLM.

### 3b. MCP Server Integration
The `notebooklm-mcp` server bridges Antigravity to the Knowledge Base.
- **Usage**: Query the MCP for document synthesis, risk grounding, or SDK pattern verification.
- **Example**: *"Based on TradingAgents, should we rescue BTC perps at 13% margin ratio?"*

---

## 4. SDK Landscape

### 4a. Circle Financial Stack
- **AI Skills**: `circlefin/skills` for agentic blockchain interactions.
- **Dev-Controlled Wallets**: `@circle-fin/developer-controlled-wallets` for secure signing.
- **Smart Contract Platform**: `@circle-fin/smart-contract-platform` for deployment/interaction.
- **Arc App Kit**: `@circle-fin/app-kit` for unified balance & cross-chain UI.

### 4b. Arc Network
- **RPC**: Chain ID 5042002 (USDC as gas).
- **Arc CLI**: `arc-canteen` for progress tracking and agent context.
- **Arcscan**: Testnet block explorer for verification.

### 4c. Hyperliquid
- **Python SDK**: `hyperliquid-python-sdk` for testnet REST/WS APIs.

---

## 5. Judging Matrix (Maximizing Score)

| Criterion (Weight) | AGORA-glass Implementation | Evidence |
|--------------------|----------------------------|----------|
| **Agentic Sophistication (30%)** | Autonomous monitor-assess-decide-execute loop. | BusSpy output & self-auditing traces. |
| **Traction (30%)** | Real testnet transactions & user onboarding metrics. | `arc-canteen update-traction` history. |
| **Circle Utilization (20%)** | Integrated Arc, Gateway, CCTP, Wallets, App Kit, CLI. | 6+ primitives demonstrated in demo. |
| **Innovation (20%)** | "Glass-Box" reasoning: decision logic on-chain. | Arcscan event logs for reasoning hashes. |

---

## Quick‑Start Sequence

1. **Initialize CLI**: `uv tool install git+...ARC-cli.git && arc-canteen login`
2. **AI Skills**: Install `circle-skills@circle` in your AI environment.
3. **Hyperliquid**: `pip install hyperliquid-python-sdk`
4. **Contracts**: Scaffold Hardhat with `@circle-fin` SDKs.
5. **Frontend**: Scaffold Next.js with `@circle-fin/app-kit`.
6. **NotebookLM**: Configure `notebooklm-mcp` and upload docs.
