# /deploy-contracts – Deploy AGORA‑glass to Arc Testnet

## Steps
1. **Environment Validation**
   - Ensure `$RPC` is active.
   - Verify `AGENT_PRIVATE_KEY` has testnet USDC for gas.
2. **Compile**
   ```bash
   cd contracts
   npx hardhat compile
   ```
3. **Deploy Registry**
   ```bash
   npx hardhat run scripts/deploy_registry.ts --network arcTestnet
   ```
4. **Deploy Vault**
   ```bash
   npx hardhat run scripts/deploy_vault.ts --network arcTestnet
   ```
5. **Whitelisting**
   - Call `Vault.setAgent(AGENT_ADDRESS)` to authorize the Python sentinel.
6. **Verification**
   - Save addresses to `docs/config/addresses.json`.
   - Update frontend and agent `.env` files.
