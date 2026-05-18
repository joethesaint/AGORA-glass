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
3. **Establish Research Context**
   ```bash
   git clone --recursive https://github.com/the-canteen-dev/context-arc research/context-arc
   # Note: Ensure 'research/' is ignored in your .gitignore
   ```
4. **Python Environment**
   ```bash
   uv venv
   source .venv/bin/activate  # or .venv\Scripts\activate on Windows
   uv sync
   ```
5. **Node Dependencies**
   ```bash
   cd contracts && npm install
   cd ../agora-dashboard && npm install
   ```
6. **Secrets Configuration**
   ```bash
   cp .env.example .env
   # Ensure RPC, AGENT_PRIVATE_KEY, and HYPERLIQUID_API_KEY are set.
   ```
7. **Integrity Check**
   ```bash
   PYTHONPATH="." uv run pytest
   arc-canteen rpc eth_blockNumber
   ```

---

### 📋 AI Agent Initialization:
If you are using an AI agent (like Gemini CLI), provide it with this prompt after running the steps above:

> "I have initialized the AGORA-glass environment. Please verify the setup:
> 1. Check that `research/context-arc` is present and `.gitignore` protects it.
> 2. Confirm `$RPC` is set in the environment or `.env`.
> 3. Run the test suite to ensure the sentinel logic is intact."
