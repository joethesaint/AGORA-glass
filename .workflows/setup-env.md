# /setup-env – Initialise the Development Environment

This workflow bootstraps the entire project for a new team member.

## Steps
1. **Install Arc CLI**
   ```bash
   uv tool install git+https://github.com/the-canteen-dev/ARC-cli.git
   arc-canteen login
   ```
2. **Export RPC & Sync Context**
   ```bash
   arc-canteen shell-init
   arc-canteen context sync
   ```
3. **Python Environment**
   ```bash
   uv venv
   source .venv/bin/activate  # or .venv\Scripts\activate on Windows
   uv sync
   ```
4. **Node Dependencies**
   ```bash
   cd frontend && npm install
   cd ../contracts && npm install
   ```
5. **Secrets Configuration**
   ```bash
   cp .env.example .env
   # Ensure RPC, AGENT_PRIVATE_KEY, and HYPERLIQUID_API_KEY are set.
   ```
6. **Integrity Check**
   ```bash
   $env:PYTHONPATH = "."; uv run pytest
   arc-canteen rpc eth_blockNumber
   ```
