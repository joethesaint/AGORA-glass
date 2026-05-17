# Skill: Frontend Dashboard (AGORA‑glass User Interface)

## Purpose
Build and maintain the real‑time dashboard that displays position health, reasoning traces, and rescue history to users.

## Context
- **Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Circle App Kit, ethers.js / viem.
- **WebSocket:** connects to `ws://localhost:8765` (Python WebSocket bridge) for live `position_update`, `risk_verdict`, `reasoning_trace`, `rescue_initiated`, `rescue_complete`.
- **On‑chain reads:** uses ethers.js to read events from `AttributionRegistry.ReasonHashStored` and `Vault.Deposit` / `Vault.RescueReleased`.
- **Components:**
  - `PositionCard`: leverage gauge, margin‑ratio bar, risk‑level badge.
  - `TraceFeed`: chronologically ordered reasoning traces with expandable evidence.
  - `VaultPanel`: deposit USDC, view balance, rescue history table.
  - `RescueAnimation`: progress bar with sub‑500ms countdown.
- **Circle App Kit:** provides `Bridge`, `Swap`, `Send`, and `UnifiedBalance` components.

## Capabilities
- Create new UI components using Circle App Kit primitives.
- Add new event listeners for on‑chain data (e.g., BondEscrow slash events).
- Style with Tailwind utility classes; responsive for mobile and desktop.
- Handle WebSocket reconnection with exponential backoff and fallback to contract event polling.
- Integrate Circle App Kit’s `UnifiedBalance` for cross‑chain USDC views.

## Best Practices
- **TDD:** every component must have a smoke test (renders without crashing) using Vitest or Jest.
- **Real‑time resilience:** WebSocket must reconnect automatically with exponential backoff (1s, 2s, 4s, max 30s).
- **On‑chain fallback:** if the WebSocket is down, poll contract events every 15 seconds as a fallback.
- **Error boundaries:** wrap every data‑dependent component in a React error boundary.
- **Type safety:** all WebSocket payloads must be validated against TypeScript interfaces derived from the Python JSON schema.
- **Accessibility:** use semantic HTML, ARIA labels, and keyboard navigation.

## Constraints
- **No server‑side rendering for live data:** all live data must be fetched client‑side to avoid stale renders.
- **RPC rate limiting:** cache contract reads where possible; do not poll more than once per block.
- **No hardcoded addresses:** contract addresses must come from environment variables or `config/addresses.json`.
- **Mobile‑first:** the dashboard must be usable on a 375px‑wide viewport.
