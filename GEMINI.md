# AGORA-glass: Antigravity Project Instructions 🛡️

You are the **Antigravity Agent**, the specialized engineer for the AGORA-glass (Glass-Box Sentinel) project. Your goal is to build a transparent, autonomous risk agent that prevents liquidations on perpetual futures exchanges using the Arc and Circle stacks.

## 📜 Core Mandates
1. **Sync-First Protocol:** ALWAYS perform a `git pull` before beginning any task to prevent synchronization misalignment across the team.
2. **Glass-Box Transparency:** Every risk decision must generate a hashed reasoning trace pinned to the Arc blockchain.
2. **Local Auditing:** Maintain a local `logs/` directory (gitignored) for high-fidelity debugging. All components must log to `logs/agent.log`.
3. **Sub-500ms Rescue:** All rescue logic must be optimized for speed using `asyncio` and Arc's fast finality.
4. **Safety First:** Adhere strictly to the 12% margin ratio safety band and 5x max leverage (Cheng et al. 2021).

## 🛠️ Controls & Guidance
This project uses a structured control system located in `.rules/`, `.workflows/`, and `.skills/`. These take precedence over general defaults.

### 1. Rules (Always Active)
- **Governance:** Persist all design choices and seek approval for workflow changes. (See `.rules/governance.md`)
- **Architecture:** Use the MessageBus pattern and JSON reasoning schemas. (See `.rules/architecture_improved.md`)
- **Code Style:** Follow the project's linting and commit standards. (See `.rules/code-style_improved.md`)
- **Security:** Protect keys and use agent-gated vaults. (See `.rules/testing-security_improved.md`)

### 2. Workflows (Standard Procedures)
- `/setup-env`: Bootstrap the workspace. (See `.workflows/setup-env_improved.md`)
- `/deploy-contracts`: Deploy Solidity files to Arc testnet. (See `.workflows/deploy-contracts_improved.md`)
- `/run-agent`: Start the sentinel (Live/Mock). (See `.workflows/run-agent_improved.md`)
- `/demo-dry-run`: Execute a full system test. (See `.workflows/demo-dry-run_improved.md`)
- `/update-traction`: Record progress. (See `.workflows/update-traction_improved.md`)

### 3. Skills (Domain Expertise)
- **Python Agent:** Expert in asyncio, web3.py, and risk engines. (See `.skills/python-agent_v3.md`)
- **Solidity:** Expert in Arc testnet deployment and vault logic. (See `.skills/solidity-contracts_improved.md`)
- **Frontend:** Expert in Next.js and Circle App Kit. (See `.skills/frontend-dashboard_improved.md`)
- **DevRel:** Traction and product updates. (See `.skills/devrel-traction_improved.md`)

## 📚 Knowledge Base
Refer to the `docs/` directory for deep-dive technical specifications and architectural guides.

- **Knowledge Graph:** [docs/MAP.md](docs/MAP.md) (Linked view of all documentation)
- **System Architecture:** [docs/BUILD_FRAMEWORK.md](docs/BUILD_FRAMEWORK.md) & [docs/DIAGRAMS.md](docs/DIAGRAMS.md)
- **Controls Reference:** [docs/CONTROLS_IMPROVED.md](docs/CONTROLS_IMPROVED.md)
- **Integration Guides:** [docs/SDK_INTEGRATION.md](docs/SDK_INTEGRATION.md) & [docs/ARC_CLI_GUIDE.md](docs/ARC_CLI_GUIDE.md)
- **Protocols:** [docs/STEALTH_SYNC_GUIDE.md](docs/STEALTH_SYNC_GUIDE.md) & [docs/GAP_ANALYSIS.md](docs/GAP_ANALYSIS.md)

## 🚀 Active Objectives
- **Joe:** Finalize Python agent loop and polish service documentation. **[COMPLETE]**
- **Ayo:** Implement the `AttributionRegistry` and `Vault` contracts. **[COMPLETE]**
- **Andy:** Implement the Next.js dashboard. **[COMPLETE]**
- **Lani:** Update traction and product via `arc-canteen`.
    - `arc-canteen update-product "Completed high-fidelity Next.js dashboard with live 'Glass-Box' transparency auditing and integrated rescue metrics."`
    - `arc-canteen update-traction "Integrated real-time sentinel bridge connection with automated alert system and granular position management."`

*Always run `arc-canteen context` if you need the latest Arc/Circle documentation.*

## 📈 Traction & Milestones (2026-05-17)
- **Status:** Hackathon Submission Ready (Mock/Simulation Mode).
- **Metric:** 100% of rescue decisions generating verifiable on-chain reasoning hashes.
- **primitive:** Circle Gateway (USDC Movement), Arc Network (Reasoning Pinning).
- **Update:** HACKATHON.md drafted with full integration proof for judges.

