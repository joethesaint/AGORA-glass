# /update-traction – Report Progress via Arc CLI

## Steps
1. **Compile Metrics**
   - Extract data from logs or `arc-canteen status`:
     - Test users onboarded.
     - Total USDC "Rescued" in simulation.
     - Number of unique reasoning traces pinned to Arc.
2. **Submit Product Update**
   ```bash
   arc-canteen update-product "Refactored agent with BaseClasses, logging, and 100% test coverage for risk logic."
   ```
3. **Submit Traction Update**
   ```bash
   arc-canteen update-traction "Reached milestone: First successful end-to-end autonomous rescue in mock mode."
   ```
4. **Verify Status**
   ```bash
   arc-canteen status
   ```
5. **Sync Context**
   - Keep development grounded in the latest research:
   ```bash
   arc-canteen context sync
   ```
