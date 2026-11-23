# 🤝 AGORA-glass: Cross-Agent Collaboration Guide

This document serves as the coordination hub for **Joe (Python Agent)**, **Ayo (Solidity Contracts)**, and **Andy (Frontend Dashboard)**. It defines the technical bridges and protocols required for the "Glass-Box" sentinel integration.

---

## 1. 🏗️ Joe (Agent) ↔ Ayo (Contracts)
The Python Agent acts as the autonomous operator of the Solidity contracts.

### 📍 Contract Addresses
- **Standard:** All deployed contract addresses must be registered in `configs/addresses.json`.
- **Format:**
  ```json
  {
    "arc_testnet": {
      "AttributionRegistry": "0x...",
      "Vault": "0x..."
    }
  }
  ```
- **Joe's Action:** `ArcPinner` and `RescueDispatcher` read this file to resolve targets.

### 📜 ABI Management & Symlinks
To ensure the Agent always uses the latest contract signatures without manual copying:
- **Protocol:** We use a symlink from the Hardhat artifacts to the Python source.
- **Setup:**
  ```bash
  # Run this from the project root
  mkdir -p src/abis
  ln -s ../contracts/artifacts/contracts/AttributionRegistry.sol/AttributionRegistry.json src/abis/AttributionRegistry.json
  ln -s ../contracts/artifacts/contracts/Vault.sol/Vault.json src/abis/Vault.json
  ```
- **Python Usage:**
  ```python
  with open("src/abis/AttributionRegistry.json") as f:
      registry_abi = json.load(f)["abi"]
  ```

---

## 2. 🎨 Joe (Agent) ↔ Andy (Frontend)
The Agent provides the real-time heartbeat for the dashboard.

### 🌐 WebSocket Bridge
- **Endpoint:** `ws://localhost:8765`
- **Component:** `src/ws_server.py`
- **Andy's Action:** Connect to this port to ingest the sentinel's internal state.

### 📊 Event Schemas
All data sent over the WebSocket follows the dataclasses defined in `src/events.py`.
- **Key Events to Monitor:**
  - `PositionUpdate`: Live margin/leverage per account.
  - `RiskVerdict`: Status changes (SAFE → WARNING → CRITICAL).
  - `ReasoningTrace`: The "Glass-Box" proof (contains `reason_hash`).
  - `RescueComplete`: Final confirmation and transaction links.
- **Example Payload:**
  ```json
  {
    "type": "ReasoningTrace",
    "data": {
      "reason_hash": "0x...",
      "margin_ratio": 0.09,
      "evidence": ["Margin below 12% threshold"]
    },
    "timestamp": 1715974000.0
  }
  ```

---

## 3. 🛡️ Operational Rules for Smooth Integration
1. **Sync-First:** Always `git pull` before working on cross-component features to capture latest ABIs or event schemas.
2. **Mock-Safe:** Ensure all components support `mode="mock"`. This allows Andy to build the UI and Joe to test logic without Ayo's contracts being fully deployed.
3. **Environment Parity:** Use the `.env.example` as the baseline. If Joe needs a new key (e.g., `CIRCLE_API_KEY`), he must add it to the example file for Andy and Ayo.
4. **Transparent Logic:** If Joe changes the `RiskEngine` thresholds, he must update `COLLABORATION_UPDATES.md` if it impacts how Andy displays "Warning" states.

---

*Last Updated: 2026-05-17 by Joe (Antigravity Agent)*
