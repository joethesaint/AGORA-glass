# 🚀 Arc Testnet Live Deployment Guide

This guide outlines the steps to move the AGORA-glass sentinel from **Mock Mode** to **Live Mode** on the Arc Testnet.

## 📋 Prerequisites
1. **Agent Wallet**: A private key with at least 0.1 Arc-native USDC (for gas).
2. **Circle API**: A valid `CIRCLE_API_KEY` and `CIRCLE_ENTITY_SECRET`.
3. **Hyperliquid Account**: A public address to monitor.

---

## 🛠️ Step 1: Prepare the Environment
1. **Generate or Import Wallet**:
   If you don't have a wallet, run:
   ```bash
   cd contracts && npx hardhat run scripts/generate-wallet.ts
   ```
2. **Fund the Wallet**: 
   Send Arc-native USDC (gas) to the generated address.
3. **Update `.env`**:
   Add your `AGENT_PRIVATE_KEY` and `MONITOR_ACCOUNT` to the root `.env` file.

---

## 🚢 Step 2: Deploy Contracts
Deploy the transparency and governance layer to the Arc Testnet:
```bash
cd contracts && npm run deploy
```
*This script will save the new contract addresses to `contracts/config/addresses.json`.*

Update your root `.env` with the resulting addresses:
- `REGISTRY_ADDRESS` (from AttributionRegistry)
- `VAULT_ADDRESS` (from Vault)

---

## 🔄 Step 3: Configure Circle DCW
1. **Register Entity Secret**:
   ```bash
   python3 scripts/register_entity_secret.py
   ```
2. **Setup Developer-Controlled Wallet**:
   ```bash
   python3 scripts/setup_wallet.py
   ```
3. **Update `.env`**:
   Add the resulting `CIRCLE_WALLET_ID` to your `.env` file.

---
## 🛡️ Step 4: Run the Sentinel
Start the agent in live mode:
```bash
PYTHONPATH=. python3 src/main.py --mode live
```

### 👥 Scaling: Multi-Agent Deployment
You can run multiple instances of the sentinel (e.g., one per account or one per strategy) by overriding the `AGENT_ID`:

```bash
# Instance 1
AGENT_ID=agora-glass-01 PYTHONPATH=. python3 src/main.py --mode live --account 0xAddress1

# Instance 2
AGENT_ID=agora-glass-02 PYTHONPATH=. python3 src/main.py --mode live --account 0xAddress2
```
*Each instance will automatically include its unique `agent_id` in all on-chain reasoning traces and logs, enabling granular auditing in the "Glass-Box" terminal.*

### 🔍 Verification
...
- Check [Arcscan](https://testnet.arcscan.app/) for your `AGENT_PRIVATE_KEY` address.
- You should see `registerAgent` (ERC-8004) and `pin` (Reasoning Trace) transactions appearing in real-time.
