# 💰 AGORA-glass: Revenue & Fee Architecture Roadmap

This document outlines the evolutionary path for monetizing AGORA-glass, transitioning from our current functional Proof-of-Concept to a sustainable, decentralized protocol.

## 1. Phase I: The "Success Fee" Model (Current PoC State)
*   **Mechanism:** Off-chain capture.
*   **Logic:** The Python `RescueDispatcher` calculates the rescue requirement. Upon success, the system charges a fixed % fee on the rescued liquidity.
*   **Implementation:** Handled by the off-chain `CircleRescuer` as part of the job settlement.
*   **Why:** Minimal audit risk; zero friction; focuses entirely on demonstrating protection utility to judges.

## 2. Phase II: Protocol-Integrated Fee Splitting (Roadmap)
*   **Mechanism:** Smart contract fee-capture.
*   **Update to `Vault.sol`:** Introduce a `FeeCollector` address.
*   **Update to `releaseForRescue`:**
    ```solidity
    function releaseForRescue(...) external onlyAgent {
        uint256 fee = (_amount * feeBps) / 10000;
        uint256 netRescue = _amount - fee;
        usdc.transfer(feeCollector, fee); // Protocol capture
        usdc.transfer(agent, netRescue);  // Liquidity routing
    }
    ```
*   **Why:** Provides automated revenue for the protocol without needing off-chain intervention for accounting.

## 3. Phase III: Decentralized Sentinel Staking
*   **Mechanism:** Fee-sharing and slashing.
*   **Logic:** Third-party entities can run their own "Sentinel" nodes by staking USDC in the `Vault`.
*   **Attribution:** The `AttributionRegistry` links successful rescues to specific nodes.
*   **Why:** Scales the network. Fees are distributed proportionally to staked sentinels based on the total risk mitigated.
*   **Security:** Misbehavior or failing to rescue during a breach results in a slashing event, incentivizing high performance.

---
*Strategy for Hackathon Judges: "We have prioritized functional safety and auditability in our contracts for the MVP. Our revenue architecture is designed as a modular layer to be activated once the protocol matures past the initial liquidity-bootstrap phase."*
