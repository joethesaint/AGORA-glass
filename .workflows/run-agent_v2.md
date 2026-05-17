# /run-agent – Start the Glass‑Box Sentinel Agent (v2)

## Steps
1. Activate Python environment:
   ```bash
   source .venv/bin/activate
   ```
2. Ensure environment variables are loaded:
   ```bash
   set -a && source .env && set +a
   ```
3. Start the agent (live mode):
   ```bash
   python src/main.py --live
   ```
   - The agent will fetch live Hyperliquid testnet data.
   - If the API is down, use mock mode:
   ```bash
   python src/main.py --mock
   ```
4. Open the BusSpy console to monitor signals:
   ```bash
   python -m src.bus
   ```
   (This is already included in `main.py`; just watch the coloured output.)
5. In a separate terminal, start the WebSocket bridge for the frontend:
   ```bash
   python src/ws_bridge.py
   ```
6. Frontend should now display live data at `http://localhost:3000`.
