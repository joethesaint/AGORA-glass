# Skill: Python Agent Development

**Purpose:** Assist with writing, debugging, and optimising the AGORA‑glass off‑chain agent.

---

## Context

- **Frameworks**: asyncio, Polars, web3.py
- **Architecture**: PerpMonitor → RiskEngine → ReasoningTracer → RescueDispatcher (connected via MessageBus)
- **Risk model**: margin ratio thresholds (SAFE >30%, WARNING 20–30%, CRITICAL <12%), max leverage 5× (Cheng et al. 2021)
- **Rescue target**: bring margin ratio to 25%
- **Data source**: Hyperliquid testnet API (`https://api.hyperliquid-testnet.xyz`) with fallback to mock data
- **On‑chain interaction**: 
  - `AttributionRegistry.storeReason(bytes32)`
  - `Vault.releaseForRescue(amount, chain, recipient)`
- **Reasoning trace JSON schema**: see [`.rules/architecture.md`](.rules/architecture.md)

---

## Capabilities

- Generate new monitoring endpoints for additional perp DEXs.
- Optimise async loops for multiple accounts.
- Debug web3 transaction failures (e.g., nonce too low, insufficient gas).
- Write unit tests for the RiskEngine with Polars DataFrames.

---

## Best Practices

- **Async programming**:  
  - Prefer `async`/`await` and non-blocking calls; avoid `time.sleep()` in coroutines.
  - Use `asyncio.gather` for parallel I/O-bound tasks.
- **Data handling**:  
  - Prefer Polars for DataFrame operations (faster than pandas for large datasets).
  - Validate all external API responses, fallback to mock or cached data on error.
- **Type safety**:
  - Use Python type hints (`typing`) in all public functions.
  - Run `mypy` in CI for stricter checks.
- **Web3 interactions**:
  - Always handle `TransactionNotFound`, nonce errors, and underpriced tx exceptions.
  - Wrap sensitive calls in retries with exponential backoff.
  - Never hardcode private keys—use secure environment management.
- **Testing**:
  - Use `pytest` with explicit test cases for each risk scenario.
  - Mock web3 and API responses for offline/CI testing.
- **Error handling**:
  - Catch and log exceptions at task boundaries to aid debugging.
  - Prefer raising custom exceptions for known error states.

---

## Constraints

- **Max leverage limit** must not exceed 5× (from Cheng et al., 2021).
- **Margin states**:
  - SAFE: ratio > 30%
  - WARNING: 20–30%
  - CRITICAL: < 12%
- **Automated rescue** must target a margin ratio of exactly 25%.
- **Data fallback**: if Hyperliquid testnet API fails, agent must use mock data and log the fallback.
- **Authorization**: only invoke on-chain actions (`storeReason`, `releaseForRescue`) after validated risk assessment.
- **Concurrency limit**: Do not exceed 20 concurrent running tasks per agent instance (to avoid I/O exhaustion).
- **Code style**: follow [PEP8](https://peps.python.org/pep-0008/) and [PEP257](https://peps.python.org/pep-0257/) for docstrings.

---
