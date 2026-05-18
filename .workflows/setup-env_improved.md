# /setup-env – Initialise the AGORA‑glass Development Environment

Bootstraps the entire project for a new team member. Run this workflow once on a fresh machine.

## Pre‑requisites
- Python 3.11+
- Node.js 20+
- Git
- A GitHub account (for `arc-canteen login`)

## Steps

### 1. Install Arc CLI
```bash
uv tool install git+https://github.com/the-canteen-dev/ARC-cli.git
arc-canteen login
```

### 2. Export RPC & Sync Agent Context
```bash
arc-canteen shell-init
arc-canteen context sync
```
Verify with:
```bash
arc-canteen rpc eth_blockNumber
```

### 3. Clone the Repository
```bash
git clone https://github.com/<team>/agora-glass.git
cd agora-glass
```

### 4. Python Virtual Environment
```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```

### 5. Node Dependencies (Contracts)
```bash
cd contracts && npm install
```

### 6. Node Dependencies (Dashboard - Turborepo Monorepo)
```bash
cd ../agora-dashboard && npm install
```
This installs dependencies for the entire monorepo including:
- `apps/web` - Main Vite + React dashboard
- `packages/ui` - Shared UI component library with shadcn/ui

### 7. Configure Environment Variables

**Backend (.env):**
```bash
cd .. && cp .env.example .env
```
Fill in required keys:
- `HYPERLIQUID_API_KEY` – from Hyperliquid testnet dashboard
- `AGENT_PRIVATE_KEY` – agent's Arc wallet private key
- `RPC` – should already be set by `arc-canteen shell-init`

**Dashboard (.env):**
```bash
cd agora-dashboard/apps/web && cp .env.example .env
```
Fill in required keys:
- `VITE_WS_URL` – WebSocket URL (default: `ws://localhost:8765`)
- `VITE_CIRCLE_APP_ID` – Circle App ID from Circle Developer Console
- `VITE_REGISTRY_ADDRESS` – AttributionRegistry contract address on Arc
- `VITE_VAULT_ADDRESS` – Vault contract address on Arc

### 8. Verify
```bash
# Python
python -c "from src.bus import MessageBus; print('Python OK')"

# Contracts
cd contracts && npx hardhat compile && echo "Solidity OK"

# Dashboard
cd ../agora-dashboard && npm run dev && echo "Dashboard OK"
```
Dashboard should start on `http://localhost:5173/` (or next available port)

### 9. Submit Your First Update
```bash
arc-canteen update-product "Environment setup complete – ready to build AGORA‑glass"
