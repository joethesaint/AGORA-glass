# Code Style & Commit Convention (Checklist)

## Pre‑Commit Checklist (every commit)
- [ ] Python: `black --check .` passes
- [ ] Python: `ruff check .` passes
- [ ] Solidity: `prettier --check 'contracts/**/*.sol'` passes
- [ ] Solidity: `solhint 'contracts/**/*.sol'` passes
- [ ] TypeScript: `prettier --check 'frontend/**/*.ts'` passes
- [ ] TypeScript: `eslint 'frontend/**/*.ts'` passes

## Commit Message Checklist
- [ ] Prefix with type: `feat:`, `fix:`, `docs:`, `chore:`, `test:`
- [ ] Include module name: `feat(monitor): add Hyperliquid position fetch`
- [ ] No commit longer than 72 characters in the subject line

## PR Checklist
- [ ] Branch named `feat/<module>` or `fix/<issue>`
- [ ] All tests pass (Python: `pytest`, Solidity: `npx hardhat test`, Frontend: `npm test`)
- [ ] At least one teammate has reviewed and approved
- [ ] PR description links to the corresponding `arc-canteen` update
