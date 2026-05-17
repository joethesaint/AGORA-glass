# Skill: Frontend Dashboard (v2)

**Purpose:** Build and maintain the AGORA‑glass user interface.

## Context
- Stack: Next.js 14 (App Router), TypeScript, Tailwind CSS, Circle App Kit.
- WebSocket: connects to `ws://localhost:8765` (Python bridge) for live position and risk verdicts.
- On‑chain reads: uses `ethers.js` (or viem) to read events from `AttributionRegistry` and `Vault`.
- Components:
  - `PositionCard`: shows leverage, margin ratio, risk level.
  - `TraceFeed`: real‑time feed from WebSocket.
  - `VaultPanel`: deposit USDC, view balance, rescue history.
  - `RescueAnimation`: visual countdown during cross‑chain transfer.

## Capabilities
- Create new components using Circle App Kit (Bridge, Swap, Wallet).
- Add new event listeners for on‑chain data.
- Style with Tailwind utility classes.
- Handle WebSocket reconnection and fallback to contract events.
