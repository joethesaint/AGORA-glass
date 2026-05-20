# /update-traction – Submit a Traction Update via Arc CLI

Records daily traction metrics for the hackathon judges.

## Pre‑requisites
- `arc-canteen login` completed.

## Steps

### 1. Gather Metrics
Before running, collect:
- Number of test users onboarded (cumulative)
- Total mock rescues performed
- Total USDC moved (sum of rescue amounts)
- On‑chain transactions (count of `storeReason` calls)
- Any community feedback or testimonials

### 2. Format the Update
Use this template:
```
"Day X: [N] users onboarded, [M] rescues performed, [amount] USDC saved. [optional highlight]"
```
Example:
```
"Day 3: 5 users onboarded, 12 rescues performed, 3,500 USDC saved. Demo recorded with live Gateway flow."
```

### 3. Submit
```bash
arc-canteen update-traction "Day 3: 5 users onboarded, 12 rescues performed, 3,500 USDC saved."
```

### 4. Verify
```bash
arc-canteen status
```
Confirm the update appears in the dashboard.

### 5. Share
Post the status screenshot in the team Discord channel.
