import asyncio
import signal
import argparse
from src.monitor import PerpMonitor

# Register components to ensure singletons are initialized and subscribed
import src.engine as _engine  # noqa: F401
import src.tracer as _tracer  # noqa: F401
import src.dispatcher as _dispatcher  # noqa: F401

async def main():
    parser = argparse.ArgumentParser(description="AGORA-glass: Glass-Box Sentinel")
    parser.add_argument("--mode", choices=["mock", "live"], default="mock", help="Execution mode (default: mock)")
    parser.add_argument("--account", type=str, help="Hyperliquid account address to monitor")
    args = parser.parse_args()

    print(f"🛡️ AGORA-glass: Glass-Box Sentinel Starting in {args.mode} mode...")

    perp_monitor = PerpMonitor(mode=args.mode, account_address=args.account)

    # Define stop event for graceful shutdown
    stop_event = asyncio.Event()

    def handle_exit():
        print("\n🛑 Shutdown signal received. Closing sentinel...")
        stop_event.set()

    # Register signal handlers
    try:
        loop = asyncio.get_running_loop()
        for sig in (signal.SIGINT, signal.SIGTERM):
            loop.add_signal_handler(sig, handle_exit)
    except (NotImplementedError, ValueError):
        # add_signal_handler is not implemented on Windows or when not in main thread
        pass

    # Start monitor task
    perp_task = asyncio.create_task(perp_monitor.run())
    stop_task = asyncio.create_task(stop_event.wait())

    print("✅ Sentinel is active and monitoring positions.")

    try:
        # Run until stop_event is set or monitor finishes
        done, pending = await asyncio.wait(
            [perp_task, stop_task],
            return_when=asyncio.FIRST_COMPLETED
        )
    finally:
        perp_task.cancel()
        stop_task.cancel()
        print("👋 AGORA-glass shutdown complete.")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
