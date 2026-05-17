# Testing & Security Rules (Enforceable)

## Testing
- [ ] Every Python module must have a `tests/test_<module>.py` file.
- [ ] Every Solidity contract must have a corresponding `.test.ts` file in `contracts/test/`.
- [ ] Every frontend component must have at minimum a smoke test (renders without crashing).
- [ ] Before merging any PR, all test suites must pass:
  - `cd src && pytest`
  - `cd contracts && npx hardhat test`
  - `cd frontend && npm test`

## Security
- [ ] Smart contracts must use `msg.sender` for authorisation; `tx.origin` is forbidden.
- [ ] Agent private key must be stored in `.env` and never committed.
- [ ] `.env` must be in `.gitignore`; only `.env.example` may be committed.
- [ ] No sensitive values (private keys, API secrets) may appear in logs or console output.
- [ ] All external contract calls must use a reentrancy guard if they transfer funds.

## On‑Chain Verification
- [ ] After every `storeReason` call, the agent must verify the transaction receipt and confirm the `ReasonHashStored` event was emitted.
- [ ] The rescue amount must never exceed the Vault balance.
