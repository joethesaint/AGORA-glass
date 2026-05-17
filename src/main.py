import asyncio
import signal
from src.monitor import PerpMonitor
from src.market_monitor import market_monitor

# Register components to ensure singletons are initialized and subscribed
import src.engine as _engine  # noqa: F401
import src.tracer as _tracer  # noqa: F401
import src.dispatcher as _dispatcher  # noqa: F401


async def main():
    print("🛡️ AGORA-glass: Glass-Box Sentinel Starting...")

    perp_monitor = PerpMonitor(mode="mock")

    # Define stop event for graceful shutdown
    stop_event = asyncio.Event()

    def handle_exit():
        print("\n🛑 Shutdown signal received. Closing sentinel...")
        stop_event.set()

    # Register signal handlers
    loop = asyncio.get_running_loop()
    try:
        for sig in (signal.SIGINT, signal.SIGTERM):
            loop.add_signal_handler(sig, handle_exit)
    except NotImplementedError:
        # add_signal_handler is not implemented on Windows
        pass

    # Start monitors in background tasks
    perp_task = asyncio.create_task(perp_monitor.run())
    market_task = asyncio.create_task(market_monitor.run())

    print("✅ Sentinel is active and monitoring positions + market data.")

    # Keep the main loop alive until stop_event is set
    try:
        await stop_event.wait()
    finally:
        # Cleanup
        perp_task.cancel()
        market_task.cancel()
        
        await asyncio.gather(perp_task, market_task, return_exceptions=True)
        print("👋 AGORA-glass shutdown complete.")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
