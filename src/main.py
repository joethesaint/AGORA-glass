import asyncio
from src.bus import bus
import src.engine      # Register engine
import src.tracer      # Register tracer
import src.dispatcher  # Register dispatcher

async def monitor():
    print("🔭 Monitor: Starting Hyperliquid simulation...")
    # Simulation: 15% -> 11%
    for m in [0.15, 0.13, 0.11]:
        print(f"\n--- TICK: {m:.2%} ---")
        await bus.publish("position_update", {"symbol": "BTC-PERP", "margin": m})
        await asyncio.sleep(1)

async def main():
    print("🛡️ Antigravity Sentinel (Structured Mode) starting...")
    monitor_task = asyncio.create_task(monitor())
    await monitor_task
    print("\n✅ Main loop finished simulation.")

if __name__ == "__main__":
    asyncio.run(main())
