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
4. **Node dependencies (frontend)**
   ```bash
   cd frontend && npm install
   ```
5. **Configure environment**
   ```bash
   cp .env.example .env
   # Fill in required keys: HYPERLIQUID_API_KEY, AGENT_PRIVATE_KEY, etc.
   ```
6. **Verify**
   ```bash
   arc-canteen rpc eth_blockNumber
   python -c "from src.bus import MessageBus; print('OK')"
   ```
