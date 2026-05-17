# Architecture & Domain Constraints

- **Communication**: The Python agent *must* use the `MessageBus` pattern (Event-Driven Architecture) for inter-module coordination.
- **Risk Model**: All assessments *must* cite the Cheng et al. (2021) leverage bands:
  - **SAFE**: Margin Ratio > 30%
  - **WARNING**: Margin Ratio 12–30%
  - **CRITICAL**: Margin Ratio < 12%
- **Leverage Limit**: Max 5× leverage for BTC/ETH perpetuals to minimize margin-call risk.
- **Rescue Logic**: Automated rescues *must* target a post-rescue margin ratio of exactly 25%.
- **Glass-Box Traces**: Every action (Monitor tick, Risk assessment, Rescue) *must* generate a structured JSON reasoning trace.
- **Trace Schema**: Must include `timestamp`, `agent_id`, `action`, `account`, `leverage_before`, `margin_ratio`, `rescue_amount_usdc`, `evidence[]`, `risk_rating`, and `reason_hash`.
- **Settlement**: Smart contracts *must* be deployed on Arc Testnet (Chain ID 5042002).
- **Gas Policy**: RPC URLs must be read from the `$RPC` environment variable. Native gas token is USDC.
- **Financial Primitive**: Utilize Circle App Kit and Gateway for all cross-chain USDC movements.
