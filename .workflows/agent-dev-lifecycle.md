# Workflow: GLASS Python Agent Development & Deployment

**Ideal Workflow for the GLASS Python Agent:**

1.  **Environment Initialization & Security Check:**
    *   Developers must bootstrap the environment using `arc-canteen shell-init` to securely inject the `$RPC` URL.
    *   Verify that `CIRCLE_API_KEY` and `CIRCLE_ENTITY_SECRET` (needed for Developer-Controlled Wallets) are loaded via `.env.local` and never committed to version control.
2.  **Async Development & Mock Testing:**
    *   Develop modules using `asyncio`. Use `pytest-asyncio` for test coverage.
    *   Mock the WebSocket feeds for the `PerpMonitor` to simulate rapid market crashes and verify the `RiskEngine` successfully triggers a "CRITICAL" `risk_verdict` when leverage exceeds 5x.
    *   Mock Circle Gateway REST responses to ensure the `RescueDispatcher` properly handles API limits and network timeouts without crashing the `MessageBus`.
3.  **Trace Schema & Glass-Box Validation:**
    *   Run automated Pydantic schema validation tests against the `ReasoningTracer` output to ensure it strictly matches the required JSON format: `timestamp, agent_id, action, account, leverage_before, margin_ratio, rescue_amount_usdc, evidence[], risk_rating, reason_hash`.
4.  **Local Testnet Integration (Arc & Circle):**
    *   Fund the Developer-Controlled Wallets using the Circle Testnet Faucet.
    *   Run end-to-end tests deploying hashes to the Arc Testnet `AttributionRegistry` contract, verifying that native USDC gas fees (18 decimals) behave as expected.
5.  **Deployment & Automated Monitoring:**
    *   Deploy the off-chain Python agent to a high-uptime cloud environment.
    *   Implement WebSocket connection health monitoring. If the exchange feed drops, the agent must auto-reconnect instantly to avoid blind spots.
    *   Monitor Arc RPC latency and Gateway transfer times; log alerts if rescue settlement exceeds 1.5 seconds.
