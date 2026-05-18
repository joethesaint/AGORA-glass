# /setup-env – Initialise the Development Environment (v2)

This workflow bootstraps the entire project for a new team member.

## Steps
1. **Install Arc CLI**
   ```bash
   uv tool install git+https://github.com/the-canteen-dev/ARC-cli.git
   arc-canteen login
   ```
2. **Export RPC & context**
   ```bash
   arc-canteen shell-init
   arc-canteen context sync
   ```
3. **Python virtual environment**
   ```bash
   python -m venv .venv && source .venv/bin/activate
   pip install -r requirements.txt
   ```
4. **Node dependencies (contracts & dashboard)**
   ```bash
   cd contracts && npm install
   cd ../agora-dashboard && npm install
   ```
5. **Configure environment**
   ```bash
   # Backend
   cp .env.example .env
   # Fill in: HYPERLIQUID_API_KEY, AGENT_PRIVATE_KEY, RPC
   
   # Dashboard
   cd agora-dashboard/apps/web && cp .env.example .env
   # Fill in: VITE_WS_URL, VITE_CIRCLE_APP_ID, VITE_REGISTRY_ADDRESS, VITE_VAULT_ADDRESS
   ```
6. **Verify**
   ```bash
   arc-canteen rpc eth_blockNumber
   python -c "from src.bus import MessageBus; print('OK')"
   cd agora-dashboard && npm run dev
   ```
