# /deploy-contracts – Deploy AGORA‑glass Smart Contracts to Arc Testnet

Deploys the AttributionRegistry, Vault, and optional BondEscrow contracts. Must be run by Ayo (or anyone with the deployer wallet).

## Pre‑requisites
- `/setup-env` completed.
- `$RPC` set (`arc-canteen shell-init`).
- Deployer wallet has sufficient test USDC for gas (request from Arc faucet).

## Steps

### 1. Navigate & Compile
```bash
cd contracts
npm install
npx hardhat compile
```

### 2. Run Unit Tests
```bash
npx hardhat test
```
All tests must pass before proceeding.

### 3. Deploy AttributionRegistry
```bash
npx hardhat run scripts/deploy_registry.ts --network arcTestnet
```
Save the output address to `config/addresses.json` under `AttributionRegistry`.

### 4. Deploy Vault
```bash
npx hardhat run scripts/deploy_vault.ts --network arcTestnet
```
Save the output address to `config/addresses.json` under `Vault`.

### 5. (Optional) Deploy BondEscrow
```bash
npx hardhat run scripts/deploy_bond.ts --network arcTestnet
```
Save the output address to `config/addresses.json` under `BondEscrow`.

### 6. Verify on Arcscan
```bash
npx hardhat verify --network arcTestnet <registry-address>
npx hardhat verify --network arcTestnet <vault-address>
```

### 7. Update Frontend Config
Copy `config/addresses.json` to `frontend/config/addresses.json` so Andy’s dashboard reads the deployed addresses.

### 8. Submit Update
```bash
arc-canteen update-product "Contracts deployed on Arc testnet: AttributionRegistry + Vault verified"
```

### 9. Share with Team
Post the contract addresses and ABIs in the team Discord channel.
