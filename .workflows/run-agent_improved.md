# /run-agent – Start the Glass‑Box Sentinel Agent

Launches the full off‑chain agent loop with live or mock data.

## Pre‑requisites
- `/setup-env` and `/deploy-contracts` completed.
- `.env` configured with valid `HYPERLIQUID_API_KEY` and `AGENT_PRIVATE_KEY`.
- Vault contract deployed and funded with test USDC.

## Steps

### 1. Activate Environment
```bash
source .venv/bin/activate
set -a && source .env && set +a
```

### 2. Choose Mode
- **Live mode** (requires Hyperliquid testnet API):
  ```bash
  python src/main.py --live
  ```
- **Mock mode** (offline, uses `MockPositionFeed`):
  ```bash
  python src/main.py --mock
  ```

### 3. Monitor the BusSpy
The BusSpy console prints coloured signals:
```
[14:23:01] POSITION_UPDATE
  margin_ratio: 0.11
  leverage: 4.8

[14:23:01] RISK_VERDICT
  level: CRITICAL
  rescue_amount: 500.00

[14:23:02] REASONING_TRACE
  reason_hash: 0x7f83b1...

[14:23:02] TRACE_PINNED
  tx_hash: 0x3a2c...

[14:23:02] RESCUE_COMPLETE
  confirmation_ms: 487
```

### 4. Start WebSocket Bridge (for Frontend)
In a separate terminal:
```bash
source .venv/bin/activate
python src/ws_bridge.py
```

### 5. Verify On‑Chain
Check Arcscan for the `ReasonHashStored` event using the transaction hash from `TRACE_PINNED`.

### 6. Open Frontend
Navigate to `http://localhost:3000` – the dashboard should show live data.

### 7. Stop Gracefully
Press `Ctrl+C` in both terminals. The agent logs a final `agent_shutdown` signal.
