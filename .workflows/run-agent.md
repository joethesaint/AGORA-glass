# /run-agent – Start the Glass‑Box Sentinel

## Steps
1. **Environment Initialization**
   ```bash
   # Load environment variables
   set -a && source .env && set +a
   # Activate virtual environment
   source .venv/bin/activate
   ```
2. **Start Signal Bridge**
   - In a separate terminal, start the WebSocket bridge for the frontend:
   ```bash
   $env:PYTHONPATH = "."; uv run python src/ws_bridge.py
   ```
3. **Start Agent (Mock Mode)**
   - For rapid testing and demo purposes:
   ```bash
   $env:PYTHONPATH = "."; uv run python src/main.py --mock
   ```
4. **Start Agent (Live Mode)**
   - Once API keys are configured and contracts deployed:
   ```bash
   $env:PYTHONPATH = "."; uv run python src/main.py --live
   ```
5. **Monitor Logs**
   - Watch the colored output from `BaseComponent` loggers.
   - Verify `TICK` events and `RiskVerdict` publications.
