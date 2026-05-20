# /demo-dry-run – Full System Check with Mock Data

Validates the entire loop end‑to‑end: monitor → assess → trace → rescue → on‑chain proof.

## Pre‑requisites
- All contracts deployed and verified.
- `.env` configured (mock mode works offline).

## Steps

### 1. Run in Mock Mode
```bash
source .venv/bin/activate
python src/main.py --mock
```

### 2. Verify Console Output
Confirm the BusSpy shows this sequence (in order):
1. `POSITION_UPDATE` – mock critical position
2. `RISK_VERDICT` – level `CRITICAL`
3. `REASONING_TRACE` – with 3 evidence bullets
4. `TRACE_PINNED` – Arc transaction hash present
5. `RESCUE_INITIATED` – amount, target chain
6. `RESCUE_COMPLETE` – `confirmation_ms` < 500

### 3. Verify On‑Chain
- Copy the `tx_hash` from `TRACE_PINNED`.
- Open `https://testnet.arcscan.app/tx/<tx_hash>`.
- Confirm the `ReasonHashStored` event is present and the hash matches the console output.

### 4. Verify Frontend
- Open `http://localhost:3000`.
- Confirm:
  - `PositionCard` shows “CRITICAL”.
  - `TraceFeed` shows the reasoning trace.
  - `RescueAnimation` completes.
  - `VaultPanel` balance decreases by the rescue amount.

### 5. Run Demo Script
```bash
cat docs/demo-script.md
```
Follow the script step‑by‑step, using the console and dashboard as visuals.

### 6. Submit Update
```bash
arc-canteen update-product "Dry‑run passed – full loop working end‑to‑end"
```
