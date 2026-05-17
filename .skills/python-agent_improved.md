# Skill: Python Agent Development (AGORA‑glass Off‑Chain Engine)

## Purpose
Assist with writing, debugging, and optimising the off‑chain agent that monitors perp positions, assesses risk, generates verifiable reasoning traces, and dispatches cross‑chain rescues.

## Context
- **Framework:** asyncio, Polars, web3.py, `hyperliquid-python-sdk`.
- **Architecture:** PerpMonitor → RiskEngine → ReasoningTracer → RescueDispatcher, connected via a centralised `MessageBus`.
- **Event topics:** defined exclusively in `src/events.py` — never hardcoded in modules.
- **Risk model:** margin‑ratio thresholds (SAFE > 30%, WARNING 20-30%, CRITICAL < 12%), max leverage 5× (Cheng et al. 2021), rescue target margin ratio 25%.
- **Data source:** Hyperliquid testnet API (`https://api.hyperliquid-testnet.xyz`) with `MockPositionFeed` fallback (`LIVE_MODE=false`).
- **On‑chain interaction:** calls `AttributionRegistry.storeReason(bytes32)` and `Vault.releaseForRescue(amount, chain, recipient)` via web3.py.
- **Reasoning trace JSON schema:** `timestamp`, `agent_id`, `action`, `account`, `leverage_before`, `margin_ratio`, `rescue_amount_usdc`, `evidence[]`, `risk_rating`, `reason_hash`.
- **RPC:** always read from `$RPC` (set by `arc-canteen shell-init`).

## Capabilities
- Generate new monitoring endpoints for additional perp DEXs (dYdX, GMX).
- Optimise async loops for multiple accounts using `asyncio.gather`.
- Debug web3 transaction failures (nonce too low, insufficient gas, revert reasons).
- Write unit tests for the risk engine with Polars DataFrames and `pytest`.
- Self‑audit reasoning traces and trigger optional bond slashing if risk rules are violated.

## Best Practices
- **TDD:** every module must have a passing `pytest` before a PR is opened. The first test for each module validates its core signal (e.g., `RiskEngine.assess()` returns `CRITICAL` for margin < 12%).
- **Async safety:** all network calls must use `asyncio`; never block the event loop with synchronous HTTP or file I/O.
- **Type hints:** every function signature must include complete type annotations (Polars DataFrames, custom `Position` / `RiskVerdict` dataclasses).
- **Error handling:** every external call (API, RPC) must be wrapped in `try/except` with graceful fallback; publish `error` signals to the MessageBus.
- **Trace integrity:** the reasoning hash must be verified on‑chain after submission (check transaction receipt before publishing `trace_pinned`).
- **Logging:** use `structlog` for JSON‑structured logs that feed into the BusSpy and the dashboard WebSocket.

## Constraints
- **Single process:** the agent runs as one asyncio loop; no multiprocessing, no external message queues.
- **No persistent state:** all state lives in memory; positions are re‑fetched each cycle.
- **Max rescue amount:** bounded by the Vault balance; never attempt to rescue more than available.
- **Leverage cap:** the agent must never recommend or allow leverage above 5× without an explicit override trace.
- **Gas token:** all Arc transactions use USDC; the agent’s wallet must maintain a sufficient USDC balance.
- **RPC rate limiting:** respect Arc testnet rate limits; batch calls where possible.
