# Skill: Python Agent Development

**Purpose:** Assist with writing, debugging, and optimising the AGORA‑glass off‑chain agent.

## Context
- Framework: asyncio, Polars, web3.py.
- Architecture: PerpMonitor → RiskEngine → ReasoningTracer → RescueDispatcher, connected via MessageBus.
- Risk model: margin ratio thresholds (SAFE >30%, WARNING 20‑30%, CRITICAL <12%), max leverage 5× (Cheng et al. 2021).
- Rescue target: bring margin ratio to 25%.
- Data source: Hyperliquid testnet API (https://api.hyperliquid-testnet.xyz) with fallback to mock data.
- On‑chain interaction: calls `AttributionRegistry.storeReason(bytes32)` and `Vault.releaseForRescue(amount, chain, recipient)`.
- Reasoning trace JSON schema: see `.rules/architecture.md`.

## Capabilities
- Generate new monitoring endpoints for additional perp DEXs.
- Optimise async loops for multiple accounts.
- Debug web3 transaction failures (e.g., nonce too low, insufficient gas).
- Write unit tests for the risk engine with Polars DataFrames.
