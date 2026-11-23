# 🤝 Collaboration Update: Integration Guide for Andy & Ayo

This document provides technical instructions for **Andy (Frontend)** and **Ayo (Contracts)** to integrate with the core Python agent logic in the `dev_joe` branch.

---

## 🖥️ For Andy: Dashboard & WebSocket Integration

The Python agent includes a **WebSocket Bridge** (`src/ws_server.py`) that streams real-time events from the internal MessageBus directly to your frontend.

### 🔗 Connection Details
- **Default URL:** `ws://localhost:8765`
- **Format:** Every message is a JSON object with `type`, `data`, and `timestamp`.

### 📡 Event Types to Listen For
| Event Type | Description | Key Data Fields |
|:---|:---|:---|
| `PositionUpdate` | Live position metrics from Hyperliquid. | `symbol`, `margin_ratio`, `leverage` |
| `RiskVerdict` | Sentinel's risk assessment. | `status` (SAFE/CRITICAL), `margin`, `leverage` |
| `ReasoningTrace` | The "Glass-Box" reasoning and hash. | `reason_hash`, `reasoning_text`, `evidence` |
| `RescueComplete` | Final status of a rescue operation. | `status` (SUCCESS/FAILED), `tx_hash`, `amount` |

### 🛠️ Example Integration (Frontend)
```javascript
const socket = new WebSocket('ws://localhost:8765');

socket.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  console.log(`Received ${msg.type}:`, msg.data);

  if (msg.type === 'RiskVerdict' && msg.data.status === 'CRITICAL') {
    // Trigger "CRASH" animation or alert in UI
    triggerRescueAlert(msg.data);
  }
};
```

---

## ⛓️ For Ayo: Smart Contract Integration

The `RescueDispatcher` (`src/dispatcher.py`) is already wired to target the `AttributionRegistry` contract on Arc Testnet.

### 📝 Contract Expectations
1.  **AttributionRegistry:** Ensure your live deployment has the `storeReason(bytes32 _hash)` function. The agent currently assumes this exists.
2.  **Vault:** The `RescueDispatcher` currently simulates the Vault release. Once the `Vault.sol` is deployed, provide the address so we can update the `CircleRescuer` service.

### ⚙️ Environment Variables
Update the root `.env` with your deployed addresses to bridge the agent to your contracts:
```bash
REGISTRY_ADDRESS=0x... # Your AttributionRegistry deployment
VAULT_ADDRESS=0x...    # Your Vault deployment
USDC_ADDRESS=0x...     # The USDC token address on Arc
```

### 📄 ABI Synchronization
I have scaffolded the `contracts/` directory with a deployment script. After you update the Solidity logic, please run:
```powershell
cd contracts
npx hardhat compile
```
The agent automatically uses the generated artifacts.

---

## 🚀 How to Run the Full Stack (for Testing)
1.  **Start the Agent:** `uv run python src/main.py --mode mock`
2.  **Open Dashboard:** Connect your WebSocket client to `localhost:8765`.
3.  **Watch the Flow:** The mock loop will trigger a CRITICAL verdict, generate a hash, and show a simulated rescue in under 500ms.

*Maintained by the AGORA-glass Team.*
