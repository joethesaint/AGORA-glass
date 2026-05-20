# Architecture & Domain Constraints (v2)

- The Python agent must use the MessageBus pattern for inter-module communication.
- All risk assessments must cite the Cheng et al. (2021) leverage bands: max 5× leverage, rescue target margin ratio 25%.
- Reasoning traces must follow the JSON schema: timestamp, agent_id, action, account, leverage_before, margin_ratio, rescue_amount_usdc, evidence[], risk_rating, reason_hash.
- Smart contracts must be deployed only on Arc testnet (chain ID 5042002) during development.
- Frontend must use Circle App Kit for wallet, bridge, and swap components.
- Never hard‑code RPC URLs; always read from the environment variable `$RPC` set by `arc-canteen shell-init`.
