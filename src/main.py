import asyncio
import signal
import argparse
import os
from src.monitor import PerpMonitor
from src.market_monitor import market_monitor
from src.ws_server import ws_server
from src.analytics import analytics
from src.sentiment_agent import SentimentAgent
from src.capital_agent import CapitalAgent
from src.log_config import configure_logging, get_logger
from src.config import settings

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
    parser.add_argument("--port", type=int, default=settings.server.port, help="WebSocket server port")
    args = parser.parse_args()

    logger.info("agent_startup", mode=args.mode, monitored_accounts=[args.account])

    perp_monitor = PerpMonitor(mode=args.mode, account_address=args.account)
    # Configure market monitor mode
    market_monitor.mode = args.mode
    # Configure ws_server settings
    ws_server.port = args.port
    ws_server.host = settings.server.host

    # Initialize New TradingAgents Roles
    _sentiment = SentimentAgent()
    _capital = CapitalAgent()

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

    logger.info("sentinel_active", status="monitoring", ws_port=args.port)

    try:
        # Run until stop_event is set or monitors finish
        done, pending = await asyncio.wait(
            [perp_task, market_task, ws_task, stop_task],
            return_when=asyncio.FIRST_COMPLETED
        )
        for task in done:
            name = "unknown"
            if task == perp_task: name = "perp_task"
            elif task == market_task: name = "market_task"
            elif task == ws_task: name = "ws_task"
            elif task == stop_task: name = "stop_task"
            
            if task.exception():
                logger.error("task_failed", task=name, error=str(task.exception()))
            else:
                logger.info("task_finished", task=name)
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
