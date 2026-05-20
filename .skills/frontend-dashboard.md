# Skill: Frontend Dashboard

**Purpose:** Build and maintain the AGORA‑glass high-fidelity user interface for real-time risk monitoring.

---

## Context

- **Stack**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Wallet/Bridge**: Circle App Kit (Bridge, Swap, Send components)
- **Real-time Data**: WebSocket connection to `ws://localhost:8765` (Python Bus Bridge)
- **Blockchain Connectivity**: `ethers.js` or `viem` for Arc Testnet event reading
- **UI Components**:
  - `PositionCard`: Real-time health visualization (Leverage, Margin Ratio).
  - `TraceFeed`: Live stream of "Glass-Box" reasoning traces with Arcscan links.
  - `VaultPanel`: USDC deposit interface and rescue history.
  - `RescueAnimation`: Sub-500ms visual feedback for cross-chain transfers.

---

## Capabilities

- Integrate Circle App Kit for seamless multichain USDC management.
- Implement robust WebSocket clients with automatic reconnection logic.
- Style data-dense financial dashboards using Tailwind utility classes.
- Parse on-chain `ReasonHashStored` events to populate the historical transparency log.
- Mock high-frequency ticker data for UI/UX stress testing.

---

## Best Practices

- **State Management**:
  - Use `react-query` or SWR for caching on-chain event data.
  - Keep the WebSocket data stream in a lean context to avoid unnecessary re-renders.
- **UX/UI**:
  - Use "Traffic Light" colors: Green (Safe), Amber (Warning), Red (Critical).
  - Show the "Time to Finality" for rescues to highlight Arc's sub-second speed.
- **Security**:
  - Sanitize all data received via WebSocket before rendering.
  - Use environment variables for RPC URLs and contract addresses.

---

## Constraints

- **Browser Support**: Optimize for modern evergreen browsers (Chrome, Brave).
- **Latency**: Ensure the dashboard reflects the Agent's "risk_verdict" in < 100ms from the signal arrival.
- **Transparency**: Every rescue displayed *must* have a clickable link to the reasoning hash on Arcscan.
- **Platform**: Utilize Circle App Kit primitives exclusively for bridging/swapping to maximize judging points.

---
