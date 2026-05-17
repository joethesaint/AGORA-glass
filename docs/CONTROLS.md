# Antigravity Controls: Rules, Workflows, and Skills

This document summarizes the Antigravity controls implemented for the AGORA‑glass project. These controls help maintain alignment, automate tasks, and provide specialized assistance.

---

## 1. Rules (Passive Guidance)
*Located in `.rules/`*
- **[Code Style & Commit Convention](.rules/code-style.md)**: Formatting, linting, and commit message standards.
- **[Architecture & Domain Constraints](.rules/architecture.md)**: Design patterns, thresholds, and technical constraints.
- **[Testing & Security](.rules/testing-security.md)**: Verification requirements and security best practices.

## 2. Workflows (Slash-Command Recipes)
*Located in `.workflows/`*
- **[/setup-env](.workflows/setup-env.md)**: Bootstrap the development environment.
- **[/deploy-contracts](.workflows/deploy-contracts.md)**: Deploy smart contracts to Arc testnet.
- **[/run-agent](.workflows/run-agent.md)**: Start the Glass-Box Sentinel Agent.
- **[/demo-dry-run](.workflows/demo-dry-run.md)**: Full system check with mock data.
- **[/update-traction](.workflows/update-traction.md)**: Submit traction updates via Arc CLI.

## 3. Skills (Domain-Specific Capabilities)
*Located in `.skills/`*
- **[Python Agent Development](.skills/python-agent.md)**: Expert assistance for off-chain monitoring logic.
- **[Solidity Smart Contracts](.skills/solidity-contracts.md)**: Support for on-chain contract development and deployment.
- **[Frontend Dashboard](.skills/frontend-dashboard.md)**: Guidance for the Next.js and Circle App Kit interface.
- **[DevRel & Traction](.skills/devrel-traction.md)**: Assistance with community and progress tracking.

---

## How to Use
1. **Rules**: Automatically enforced by the agent.
2. **Workflows**: Trigger with `/` commands (e.g., `/setup-env`).
3. **Skills**: Automatically loaded when relevant assistance is requested.
