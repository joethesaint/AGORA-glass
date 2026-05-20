# Architecture & Domain Rules (Enforceable)

## Event Topics
- [ ] All event topics must be defined in `src/events.py` as constants.
- [ ] No module may hardcode a string topic (e.g., `bus.publish("position_update", ...)` is forbidden; use `bus.publish(Events.POSITION_UPDATE, ...)`).

## Risk Model
- [ ] All risk assessments must reference Cheng et al. (2021) in a code comment.
- [ ] `RiskEngine.MAX_LEVERAGE` must equal `5.0`.
- [ ] `RiskEngine.RESCUE_TARGET_MARGIN` must equal `0.25`.
- [ ] `RiskEngine.CRITICAL_THRESHOLD` must equal `0.12`.

## Reasoning Traces
- [ ] Every trace must include all required keys: `timestamp`, `agent_id`, `action`, `account`, `leverage_before`, `margin_ratio`, `rescue_amount_usdc`, `evidence[]`, `risk_rating`, `reason_hash`.
- [ ] `evidence[]` must contain at least 1 and at most 5 items.
- [ ] `reason_hash` must be a valid SHA256 hex string (64 characters).

## On‑Chain
- [ ] All contract deployments must target Arc testnet (chain ID 5042002).
- [ ] The authorised agent address in `Vault.sol` must be read from an environment variable.

## Frontend
- [ ] All wallet interactions must use Circle App Kit components (`Bridge`, `Swap`, `Send`).
- [ ] Contract addresses must come from `config/addresses.json`, never hardcoded.

## RPC
- [ ] All RPC URLs must be read from `$RPC` (set by `arc-canteen shell-init`).
- [ ] No hardcoded RPC URLs anywhere in the codebase.
