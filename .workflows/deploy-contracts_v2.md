# /deploy-contracts – Deploy AGORA‑glass Smart Contracts to Arc Testnet (v2)

## Steps
1. Ensure `$RPC` is set (`arc-canteen shell-init`).
2. Navigate to the contracts directory and install deps:
   ```bash
   cd contracts && npm install
   ```
3. Compile:
   ```bash
   npx hardhat compile
   ```
4. Deploy AttributionRegistry:
   ```bash
   npx hardhat run scripts/deploy_registry.ts --network arcTestnet
   ```
   The script should output the contract address – save it to `config/addresses.json`.
5. Deploy Vault:
   ```bash
   npx hardhat run scripts/deploy_vault.ts --network arcTestnet
   ```
   Add the address to the same config file.
6. (Optional) Deploy BondEscrow:
   ```bash
   npx hardhat run scripts/deploy_bond.ts --network arcTestnet
   ```
7. Verify contracts on Arcscan (if explorer API available):
   ```bash
   npx hardhat verify --network arcTestnet <address>
   ```
8. Update the frontend `.env` with the new contract addresses.
