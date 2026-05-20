# Rules: Off-Chain Agent Contributor Checklist

**Actionable Rules for Off-Chain Agent Contributors:**

### Async Safety & Concurrency
- [ ] **No blocking calls:** Do not use `requests` or `time.sleep()`. All network operations must use `aiohttp` or `websockets`.
- [ ] **Queue management:** The `MessageBus` must use `asyncio.Queue` without bounded limits to prevent deadlock during high-volatility market events.

### Domain Logic & Constraints
- [ ] **Leverage limits:** Any pull request modifying the `RiskEngine` must enforce the Cheng et al. (2021) rule: max 5x leverage. 
- [ ] **Event Routing:** Do not hardcode event strings. You must import and use constants defined in `src/events.py` (e.g., `events.POSITION_UPDATE`, `events.RISK_CRITICAL`).

### On-Chain Security & Decimal Math
- [ ] **Chain ID enforcement:** All web3 initializations must verify connection to Arc Testnet using Chain ID `5042002`. Do not test against mainnet.
- [ ] **Decimal strictness:** Any logic dealing with Circle Gateway/CCTP transfers must use 6 decimals (ERC-20 USDC). Any logic dealing with Arc native gas sponsorship must use 18 decimals. 

### Glass-Box Compliance
- [ ] **Schema adherence:** Every `risk_verdict` evaluated as "CRITICAL" MUST trigger the `ReasoningTracer`. 
- [ ] **Hash integrity:** The `reason_hash` submitted to the Arc `AttributionRegistry` must be a valid SHA-256 hash of the exact JSON payload logged off-chain.

### Credential Hygiene
- [ ] **Never log secrets:** The `CIRCLE_ENTITY_SECRET` (used for ciphertexts) and `CIRCLE_API_KEY` must never be printed to console logs or included in reasoning traces.
