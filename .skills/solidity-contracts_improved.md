# Skill: Solidity Smart Contracts (AGORA‑glass On‑Chain Layer)

## Purpose
Support deployment, debugging, and extension of the on‑chain contracts that form the trust and custody layer of AGORA‑glass.

## Context
- **Chain:** Arc testnet (chain ID 5042002), RPC from `arc-canteen shell-init`.
- **Contracts:**
  - `AttributionRegistry.sol`: `mapping(bytes32 => uint256) public reasons;` event `ReasonHashStored(bytes32 indexed hash, uint256 timestamp)`.
  - `Vault.sol`: `mapping(address => uint256) public deposits;` modifier `onlyAgent`; function `releaseForRescue(amount, chain, recipient)`.
  - `BondEscrow.sol` (optional): performance bond with slash logic gated by agent self‑audit.
- **Compilation:** Hardhat with Solidity ^0.8.20, `@circle-fin/developer-controlled-wallets`, `@circle-fin/smart-contract-platform`.
- **Deployment:** `npx hardhat run scripts/deploy_*.ts --network arcTestnet`.
- **Verification:** Arcscan testnet explorer (`testnet.arcscan.app`).

## Capabilities
- Write and verify new contract functions (time‑locked withdrawal, multi‑sig rescue).
- Add NatSpec comments to all external/public functions.
- Generate deployment scripts that output addresses to `config/addresses.json`.
- Write Hardhat unit tests for rescue flows (authorised vs unauthorised calls).
- Debug revert reasons using `hardhat trace` or `cast run`.
- Integrate Circle DCW for agent key management.

## Best Practices
- **TDD:** every contract function must have a corresponding Hardhat test; test both happy path and revert conditions before deployment.
- **Access control:** use role‑based modifiers (`onlyAgent`, `onlyAdmin`); never rely on `tx.origin`.
- **Events:** emit events for all state‑changing operations (`Deposit`, `RescueReleased`, `ReasonHashStored`).
- **Gas optimisation:** Arc fees are ~$0.01 in USDC; still optimise storage writes and avoid loops over unbounded arrays.
- **NatSpec:** document every external function with `@notice`, `@param`, `@return`.
- **Immutable identities:** the agent’s address in `Vault.sol` should be set at construction and never changed without a time‑lock.

## Constraints
- **Only Arc testnet:** contracts must not be deployed to mainnet during the hackathon.
- **Agent address:** the authorised agent address must be an environment variable, never hardcoded.
- **No delegatecall:** contracts must not use `delegatecall` to untrusted addresses.
- **Fallback safety:** no payable fallback or receive functions unless explicitly required.
- **Solidity version:** locked to ^0.8.20; avoid nightly or experimental features.
