import asyncio
from src.monitor import PerpMonitor

# Register components


async def main():
    print("🛡️ AGORA-glass: Glass-Box Sentinel Starting...")
    monitor = PerpMonitor(mode="mock")
    await monitor.run()
    print("✅ Simulation complete.")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
