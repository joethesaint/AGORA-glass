# Testing & Security

- **Unit Testing**:
  - Python: 100% coverage for `RiskEngine` logic using `pytest`.
  - Solidity: Use Foundry or Hardhat for invariant testing of the `Vault`.
  - Frontend: Smoke tests for WebSocket connectivity using Vitest.
- **Smart Contract Security**:
  - Strictly use `msg.sender` for authorization.
  - Implement reentrancy guards on all `USDC` transfer functions.
  - Follow the **Checks-Effects-Interactions** pattern.
- **Agent Security**:
  - Private keys *must* be stored in environment variables (`AGENT_PRIVATE_KEY`).
  - No plain-text secrets in reasoning traces; only public hashes.
- **Verification**:
  - Every `CRITICAL` action must be verifiable on-chain via the `AttributionRegistry`.
  - The agent must wait for and verify the transaction receipt before confirming a rescue.
- **Mocking**:
  - CI/CD pipelines must use mock Hyperliquid and Circle Gateway responses.
