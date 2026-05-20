# ARC CLI (arc-canteen) Guide

The `arc-canteen` CLI is the primary tool for interacting with the Arc Network and the Canteen platform during the Agora Agents Hackathon. It provides utilities for environment setup, on-chain interactions, and progress tracking.

---

## 🔗 Official Documentation
For the most up-to-date information and detailed explanations, visit:
**[ARC CLI GitHub Repository](https://github.com/the-canteen-dev/ARC-cli)**

---

## 🛠️ Installation

The CLI is distributed as a Python package and is best installed using `uv`:

```bash
uv tool install git+https://github.com/the-canteen-dev/ARC-cli.git
```

---

## 🚀 Common Commands

### 1. Authentication
Login with your GitHub account to sync your progress and metrics.
```bash
arc-canteen login
```

### 2. Environment Setup
Initialize your shell with the necessary environment variables (like `$RPC`).
```bash
arc-canteen shell-init
```
*Note: This typically outputs export statements that you can source or add to your shell config.*

### 3. Progress Tracking
Submit updates for hackathon judging.
```bash
# Submit a product/technical milestone
arc-canteen update-product "Implemented sub-second rescue logic"

# Submit traction/metric milestones
arc-canteen update-traction "Onboarded 5 test users; 10 successful rescues"
```

### 4. Status & Dashboard
View your hackathon stats and current status.
```bash
arc-canteen status
```

### 5. Agent Context
Sync the latest developer documentation and sample codebases for Arc and Circle.
```bash
arc-canteen context sync
```
This downloads documentation into `~/.arc-canteen/context/` for use by your AI agents.

### 6. RPC Interactions
Execute raw JSON-RPC calls against the Arc Testnet.
```bash
arc-canteen rpc eth_blockNumber
```

---

## 💡 Best Practices
- **Sync Context Regularly:** Run `arc-canteen context sync` daily to ensure you have the latest API references.
- **Use Shell Init:** Always run `arc-canteen shell-init` in new terminal sessions to ensure `$RPC` is correctly set.
- **Submit Daily:** Use `update-product` and `update-traction` frequently to build a strong "paper trail" for the judges.
