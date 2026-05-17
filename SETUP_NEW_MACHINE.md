# 🚀 Setup Guide for New Machine (Disposable)

Copy and paste the prompt below into your **Gemini CLI** (or your preferred AI agent) immediately after pulling this repository to your new machine. This will re-establish the "Stealth Research" environment without exposing sensitive data to the repo.

---

### 📋 Copy-Paste This Prompt:

> "I have pulled the AGORA-glass repository onto this new machine. Please re-establish the local research context by executing these steps:
> 
> 1. **Clone Research Docs:** Run `git clone --recursive https://github.com/the-canteen-dev/context-arc research/context-arc`.
> 2. **Secure Environment:** Ensure the `research/` directory is still ignored in `.gitignore`.
> 3. **Initialize ARC-cli:** Run `arc-canteen login` and `arc-canteen shell-init` to set the `$RPC` variable.
> 4. **Check .env:** Create a local `.env` file and set the `RPC` variable using the endpoint provided in the project docs.
> 5. **Verify:** Run `$env:PYTHONPATH = "."; uv run pytest` to ensure the core logic is intact."

---

### ⚠️ Note
Once you have executed these steps and verified the setup, you can safely delete this file (`SETUP_NEW_MACHINE.md`).
