# Skill: DevRel & Traction (AGORA‑glass Community & Demo)

## Purpose
Assist with community building, demo preparation, and progress tracking using the Arc CLI and project knowledge base.

## Context
- **CLI commands:** `arc-canteen update-product`, `arc-canteen update-traction`, `arc-canteen status`, `arc-canteen context sync`.
- **Knowledge base:** NotebookLM loaded with `TradingAgents.pdf`, `Trading‑R1.pdf`, `Unbundling the Prediction Market Stack.html`, Consensus research summaries, Circle AI Skills docs, Arc docs.
- **Demo script:** `docs/demo-script.md`.
- **Pitch deck:** `docs/pitch-deck.pdf`.
- **Traction metrics:** number of test users, USDC saved, transactions, rescue events, on‑chain hashes stored.
- **Brand framework:** GLASS – Gateway, Liquidation, Autonomous, Safety, Sentinel.

## Capabilities
- Generate a progress report suitable for `arc-canteen update-product`.
- Draft a social media post announcing a new feature or milestone.
- Create a slide outline for the final presentation.
- Summarise key traction metrics in a judge‑friendly format.
- Query NotebookLM for research citations to strengthen the pitch.
- Prepare a fail‑over demo script (mock data) if live APIs are unavailable.

## Best Practices
- **Daily updates:** run `arc-canteen update-traction` after every standup with concrete metrics.
- **Demo resilience:** always have a pre‑recorded backup video of the full dry‑run using mock data.
- **Story first, tech second:** lead every demo with the problem (liquidation cascades), then show the solution.
- **Glass‑Box proof:** in every demo, click through to Arcscan to show the on‑chain reasoning hash.
- **GLASS framework:** map every feature to a letter of GLASS during the pitch.

## Constraints
- **No confidential data:** traction metrics must be aggregated; never expose individual user wallets publicly.
- **Time limit:** the live demo must be under 2 minutes; the founder video under 3 minutes.
- **Arc CLI only:** all official updates must use `arc-canteen`; no manual dashboard edits.
- **NotebookLM queries:** must be grounded in the uploaded documents; do not use the model’s general knowledge for risk claims.
