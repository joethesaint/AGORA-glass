# Skill: Solidity Smart Contracts

**Purpose:** Support deployment, debugging, and extension of AGORA‑glass on‑chain settlement and risk layers.

---

## Context

- **Chain**: Arc Testnet (Chain ID: 5042002)
- **Gas Token**: USDC (Native)
- **Frameworks**: Hardhat, Foundry, `@circle-fin/smart-contract-platform`
- **Core Contracts**:
  - `AttributionRegistry.sol`: Maps `bytes32 reasonHash => uint256 timestamp` for "Glass-Box" transparency.
  - `Vault.sol`: USDC custody with `onlyAgent` gated release for rescue operations.
  - `BondEscrow.sol`: Performance bond management for "Skin in the Game" slashing.
- **Interoperability**: Circle CCTP (Native Burn-and-Mint) and Circle Gateway integration.

---

## Capabilities

- Write and verify new contract functions (e.g., time‑locked withdrawals, role-based access).
- Implement gas-optimized event logging for frequent "Glass-Box" updates.
- Generate deployment scripts that output verified addresses to `docs/config/addresses.json`.
- Write comprehensive unit tests for rescue flows using mock Circle Gateway calls.
- Debug sub-second transaction reverts using `hardhat trace`.

---

## Best Practices

- **Security**:
  - Never use `tx.origin` for authorization; strictly use `msg.sender` or OpenZeppelin AccessControl.
  - Implement the `onlyAgent` modifier for all financial rescue functions.
  - Follow the **Checks-Effects-Interactions** pattern to prevent reentrancy.
- **Performance**:
  - Leverage Arc's ~780ms finality by optimizing state updates.
  - Use `indexed` parameters in events for fast filtering by the frontend.
- **USDC Integration**:
  - Use 6 decimals for all USDC calculations to avoid precision errors.
  - Interface correctly with Circle's `@circle-fin` SDKs for wallet management.

---

## Constraints

- **Deployment**: Strictly Arc Testnet only during the hackathon phase.
- **Gas**: All transactions must be denominated in USDC.
- **Finality**: Design for <1s deterministic finality; do not wait for 12+ blocks like on Ethereum.
- **Authorization**: The agent's address must be whitelisted in the `Vault` before `/run-agent` can succeed.
- **Auditability**: Every `releaseForRescue` call *must* be accompanied by a `reasonHash` update in the `AttributionRegistry`.

---
