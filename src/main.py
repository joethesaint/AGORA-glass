import asyncio
import signal
import argparse
from src.monitor import PerpMonitor
from src.market_monitor import market_monitor
from src.ws_server import ws_server
from src.analytics import analytics
from src.log_config import configure_logging, get_logger

# Initialize Structured Logging
configure_logging()
logger = get_logger("main")

# Register components to ensure singletons are initialized and subscribed
import src.engine as _engine  # noqa: F401
import src.tracer as _tracer  # noqa: F401
import src.dispatcher as _dispatcher  # noqa: F401


async def main():
    parser = argparse.ArgumentParser(description="AGORA-glass: Glass-Box Sentinel")
    parser.add_argument(
        "--mode", choices=["mock", "live"], default="mock", help="Execution mode"
    )
    parser.add_argument("--account", type=str, help="Hyperliquid account address")
    args = parser.parse_args()

    logger.info("agent_startup", mode=args.mode, monitored_accounts=[args.account])

    perp_monitor = PerpMonitor(mode=args.mode, account_address=args.account)
    # Configure market monitor mode
    market_monitor.mode = args.mode

    # Define stop event for graceful shutdown
    stop_event = asyncio.Event()

    def handle_exit():
        logger.info("shutdown_signal_received")
        stop_event.set()

    # Register signal handlers
    try:
        loop = asyncio.get_running_loop()
        for sig in (signal.SIGINT, signal.SIGTERM):
            loop.add_signal_handler(sig, handle_exit)
    except (NotImplementedError, ValueError):
        # add_signal_handler is not implemented on Windows or when not in main thread
        pass

    # Start monitor tasks
    perp_task = asyncio.create_task(perp_monitor.run())
    market_task = asyncio.create_task(market_monitor.run())
    ws_task = asyncio.create_task(ws_server.run())
    stop_task = asyncio.create_task(stop_event.wait())

    logger.info("sentinel_active", status="monitoring", ws_port=8766)

    try:
        # Run until stop_event is set or monitors finish
        done, pending = await asyncio.wait(
            [perp_task, market_task, ws_task, stop_task],
            return_when=asyncio.FIRST_COMPLETED
        )
    finally:
        perp_task.cancel()
        market_task.cancel()
        ws_task.cancel()
        stop_task.cancel()
        logger.info("agent_shutdown_complete")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
