# Code Style & Commit Convention

- **Python**: Use `black` for formatting, `ruff` for linting. All functions must have type hints.
- **Solidity**: Use `prettier-plugin-solidity` and `solhint`. NatSpec comments on all external/public functions.
- **TypeScript**: Use `prettier` and `eslint`. Strict mode in `tsconfig.json`.
- **Commits**: Follow conventional commits (`feat:`, `fix:`, `docs:`, `chore:`). Prefix with module (e.g., `feat(monitor): add Hyperliquid fetch`).
- **Environment**: Never commit `.env` files. Use `.env.example` with placeholders.
