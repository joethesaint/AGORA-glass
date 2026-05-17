# Testing & Security

- Unit tests for every Python module using `pytest`.
- Solidity tests with Hardhat/Foundry; test rescue flow with a mock Gateway.
- Frontend: at minimum, a smoke test that the dashboard loads and connects to the WebSocket.
- Smart contracts must not use `tx.origin` for authorization; use `msg.sender` with role‑based access.
- Agent private keys must be stored in environment variables and never committed.
- Reasoning hash must be verified on‑chain after submission (the agent must check the transaction receipt).
