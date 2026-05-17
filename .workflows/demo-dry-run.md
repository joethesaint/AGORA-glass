# /demo-dry-run – End-to-End System Validation

## Steps
1. **Reset State**
   - Ensure `MessageBus` is clear and monitor is in `--mock` mode.
2. **Execute Agent Loop**
   ```bash
   $env:PYTHONPATH = "."; uv run python src/main.py --mock
   ```
3. **Verify Sequence**
   - **Observe**: `PerpMonitor` emits ticks at 15%, 13%, and 9%.
   - **Orient**: `RiskEngine` triggers `CRITICAL` at the 9% tick.
   - **Decide**: `ReasoningTracer` publishes a hash starting with `0x`.
   - **Act**: `RescueDispatcher` simulates/executes the Arc txn and Circle rescue.
4. **On-Chain Verification**
   - Locate the `reason_hash` in the logs.
   - Query Arcscan: `https://testnet.arcscan.app/address/<REGISTRY_ADDR>`.
   - Confirm `ReasonHashStored` event matches.
5. **Frontend Check**
   - Open `http://localhost:3000`.
   - Verify the `PositionCard` flashed red and the `TraceFeed` updated.
