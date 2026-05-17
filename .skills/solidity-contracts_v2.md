# Skill: Solidity Smart Contracts (v2)

**Purpose:** Support deployment, debugging, and extension of AGORA‑glass on‑chain contracts.

## Context
- Chain: Arc testnet (chain ID 5042002), RPC from `arc-canteen shell-init`.
- Contracts:
  - `AttributionRegistry.sol`: `mapping(bytes32 => uint256) public reasons;` event `ReasonHashStored(bytes32 indexed hash, uint256 timestamp)`.
  - `Vault.sol`: `mapping(address => uint256) public deposits;` modifier `onlyAgent`.
  - (optional) `BondEscrow.sol`: performance bond with slash logic.
- Compilation: Hardhat with Solidity ^0.8.20.
- Deployment: `npx hardhat run scripts/deploy_*.ts --network arcTestnet`.

## Capabilities
- Write and verify new contract functions (e.g., time‑locked withdrawal).
- Add NatSpec comments.
- Generate deployment scripts that output addresses to `config/addresses.json`.
- Write Hardhat unit tests for rescue flows.
- Debug revert reasons using `hardhat trace`.
