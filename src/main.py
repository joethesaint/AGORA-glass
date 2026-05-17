import asyncio
import signal
from src.monitor import PerpMonitor

# Register components to ensure singletons are initialized and subscribed
import src.engine as _engine  # noqa: F401
import src.tracer as _tracer  # noqa: F401
import src.dispatcher as _dispatcher  # noqa: F401


async def main():
    print("🛡️ AGORA-glass: Glass-Box Sentinel Starting...")

    monitor = PerpMonitor(mode="mock")

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

    # Start the monitor in a background task
    monitor_task = asyncio.create_task(monitor.run())

    print("✅ Sentinel is active and monitoring positions.")

    # Keep the main loop alive until stop_event is set
    try:
        await stop_event.wait()
    finally:
        # Cleanup
        monitor_task.cancel()
        try:
            await monitor_task
        except asyncio.CancelledError:
            pass
        print("👋 AGORA-glass shutdown complete.")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
