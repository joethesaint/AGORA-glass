---
name: contract-architecture
description: Three AGORA-glass contracts: AttributionRegistry (hash store), Vault (USDC custody + agent rescue gate), BondEscrow (agent staking + slashing)
metadata:
  type: project
---

Three contracts in `contracts/contracts/`, all Solidity ^0.8.24, Apache-2.0, using OpenZeppelin 5.x.

## AttributionRegistry.sol
- Permissionless: anyone can call `storeReason(bytes32)` — no access control
- Maps hash → `block.timestamp`; reverts on duplicate
- `verifyReason(bytes32)` returns timestamp (0 = not found)
- Purpose: immutable audit trail of every agent decision ("Glass-Box" model)

## Vault.sol
- Holds USDC (6-decimal ERC-20) as rescue collateral
- `onlyAgent` modifier gates `releaseForRescue(amount, destinationChain, recipient, reasonHash)`
- **Quirk:** transfer goes to `agent` address, not `recipient` — agent handles the off-chain Circle Gateway call. `recipient` and `destinationChain` are only in the emitted event.
- Owner can `setAgent(address)` and `emergencyWithdraw(amount)`
- Deployed with: `Vault(USDC_ADDRESS, deployer.address)` — deployer starts as agent

## BondEscrow.sol
- Agents `stake(amount)` USDC to prove commitment to safety rules
- Owner can `slash(agent, amount)` if reasoning traces show rule violations
- Slashed funds go to `owner()`

## Tooling
- **Foundry** (`foundry.toml`): `src=contracts`, `out=out`, `libs=node_modules`; used for Forge tests and `Deploy.s.sol`
- **Hardhat** (`hardhat.config.ts`): TypeScript, `deploy.ts` script; used for `Vault.test.ts` and alternative deploys
- Two deploy paths: `scripts/Deploy.s.sol` (Forge, deploys Registry + Vault only) vs `scripts/deploy.ts` (Hardhat, deploys all 3 including BondEscrow + writes `config/addresses.json`)
- Tests: `test/AttributionRegistry.t.sol` (Forge) and `test/Vault.test.ts` (Hardhat/Chai)

## Known issues / quirks
- `hardhat.config.ts` has a hardcoded fallback RPC URL containing an API key — security risk if that file is published
- `Deploy.s.sol` does not deploy BondEscrow; only `deploy.ts` does
- No re-entrancy guard on `Vault.releaseForRescue` (low risk since it uses `usdc.transfer` not ETH, but worth noting)
- `AttributionRegistry` has no spam protection — anyone can fill it with junk hashes

**How to apply:** When modifying contracts, match the existing OZ 5.x patterns (e.g., `Ownable(msg.sender)` constructor syntax). Keep the dual-script deploy paths in sync when adding new contracts.
