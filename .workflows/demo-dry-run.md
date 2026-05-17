# /demo-dry-run – Full System Check with Mock Data

## Steps
1. Run the agent in mock mode:
   ```bash
   python src/main.py --mock
   ```
2. Verify that the console shows:
   - position_update (mock critical)
   - risk_verdict CRITICAL
   - reasoning trace with evidence
   - trace_pinned with Arc transaction hash
   - rescue_initiated and rescue_complete with sub‑500ms time.
3. Check on‑chain storage:
   - Open the Arc testnet explorer (`testnet.arcscan.app`) and paste the transaction hash from `trace_pinned`.
   - Confirm that the `ReasonHashStored` event contains the same hash printed in the console.
4. Open the frontend dashboard and confirm:
   - Position card shows “CRITICAL”.
   - Reasoning trace feed shows the trace.
   - Rescue animation completes.
   - Vault balance decreases by the rescue amount.
5. Run Lani’s demo script:
   ```bash
   cat docs/demo-script.md
   ```
   Use the console output and dashboard to illustrate each step.
