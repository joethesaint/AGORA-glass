# Skill: Python Agent (GLASS Liquidation Protector) - v3

**Purpose**
The Python agent acts as an autonomous "Perp Safety Copilot," continuously monitoring decentralized perpetual positions and executing sub-second cross-chain collateral rescues to prevent liquidation cascades. It operates as a "Glass-Box," generating verifiable, structured reasoning traces for every risk decision and pinning them to the Arc blockchain for public attribution and accountability.

**Context**
*   **Frameworks:** Python `asyncio` for non-blocking I/O; `TradingAgents` framework logic for specialized agent roles (PerpMonitor, RiskEngine, ReasoningTracer, RescueDispatcher).
*   **Architecture:** In-memory `MessageBus` (`asyncio.Queue`) for decoupled, lightning-fast inter-module communication to match underlying settlement speeds.
*   **APIs & Infrastructure:** Circle Developer-Controlled Wallets via REST API for autonomous transaction signing; Circle Gateway API for accessing unified USDC balances and initiating sub-500ms cross-chain transfers.
*   **Performance Assumptions:** Must react and trigger Gateway rescues in milliseconds. Settlement occurs on Arc Testnet (sub-second deterministic finality, ~780ms).

**Capabilities**
*   **High-Speed Ingestion:** Subscribes to exchange WebSockets to fetch live position data, funding rates, and margin ratios.
*   **Rule-Based Risk Enforcement:** Evaluates live data against hardcoded safety bands derived from Cheng et al. (2021) to trigger rescues before liquidations occur.
*   **Autonomous Capital Movement:** Calls Circle Gateway to pull USDC from a unified balance across EVMs directly to the endangered position.
*   **Verifiable Transparency:** Emits JSON-schema reasoning traces, hashes them (SHA256), and calls `storeReason(bytes32)` on the Arc `AttributionRegistry.sol` contract.

**Best Practices**
*   **Decimals Matter:** Differentiate strictly between Arc's native USDC gas (18 decimals) and ERC-20 USDC token amounts (6 decimals) when making calculations or calling contracts.
*   **Async First:** Avoid all blocking synchronous calls to ensure the agent maintains parity with Gateway and Arc's sub-second speeds.
*   **Event-Driven:** Ensure all modules solely communicate by publishing and consuming explicitly defined topics on the `MessageBus`.

**Constraints**
*   **Business Limits:** Target leverage must be strictly bound to a maximum of 5x.
*   **Technical Limits:** Must strictly operate on the Arc Testnet (Chain ID: 5042002). 
*   **Operational Limits:** RPC URLs must never be hardcoded; they must be read from `$RPC` via `arc-canteen shell-init`. 
