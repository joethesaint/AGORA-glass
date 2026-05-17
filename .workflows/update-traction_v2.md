# /update-traction – Submit a Traction Update via Arc CLI (v2)

## Steps
1. Gather metrics from the last session (e.g., number of test users, mock rescues performed, USDC moved).
2. Format a concise update: “Onboarded 2 new test users; total mock rescues: 12; USDC saved: 3,500.”
3. Submit:
   ```bash
   arc-canteen update-traction "Onboarded 2 new test users; total rescues: 12; USDC saved: 3,500."
   ```
4. Verify with:
   ```bash
   arc-canteen status
   ```
