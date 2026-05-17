# Rule: Knowledge Persistence & Workflow Governance

## 🧠 Knowledge Persistence
Every architectural decision, design style, or technical choice made during this project must be persisted to the workspace configuration. This ensures the Antigravity Agent remains aligned with the user's preferences in future sessions.

- **Design Choices:** If a specific library (e.g., `polars` over `pandas`) or pattern (e.g., `MessageBus`) is chosen, update the relevant file in `.skills/` or `.rules/architecture.md` to note this as the standard.
- **Style Enforcement:** Any preference regarding code structure, naming, or tooling must be recorded in `.rules/code-style.md`.
- **Skill Updates:** When a new capability is implemented (e.g., a specific Hyperliquid API integration), update the corresponding `.skills/` markdown to reflect that this is now a "known" expertise.

## ⚙️ Workflow Governance
Established workflows in `.workflows/` are the source of truth for operational procedures.

- **Mandatory Adherence:** The agent must follow the steps defined in a workflow when executing a corresponding command.
- **Change Management:** If a design choice or technical constraint necessitates a change to an existing workflow:
    1. **Identify the conflict:** Explain why the current workflow is insufficient or incompatible with the new design.
    2. **Propose the change:** Present the updated workflow logic to the user.
    3. **Await Approval:** Do NOT modify any file in `.workflows/` until the user has explicitly approved the change.
- **New Workflows:** When a new recurring procedure is identified, propose it to the user before creating a new file in `.workflows/`.
