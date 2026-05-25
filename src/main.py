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
from src.plugin_loader import load_plugins
from src.log_config import configure_logging, get_logger
from src.config import settings

# Initialize Structured Logging
import logging
configure_logging(log_level=logging.DEBUG)
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

    # Load any third-party plugins dropped into the plugins/ directory
    _plugins = load_plugins()

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
    perp_task_container = [asyncio.create_task(perp_monitor.run())]
    
    async def on_update_monitoring(event):
        logger.info("restarting_monitor", account=event.account, mode=event.mode)
        # Cancel current task
        if perp_task_container[0]:
            perp_task_container[0].cancel()
            try:
                await perp_task_container[0]
            except asyncio.CancelledError:
                pass
        
        # Update settings for other components if needed
        market_monitor.mode = event.mode
        
        # Start new monitor
        new_monitor = PerpMonitor(mode=event.mode, account_address=event.account)
        perp_task_container[0] = asyncio.create_task(new_monitor.run())
        logger.info("monitor_restarted", account=event.account, mode=event.mode)

    from src.bus import bus
    from src.events import UpdateMonitoringRequest
    bus.subscribe(UpdateMonitoringRequest, on_update_monitoring)

    market_task = asyncio.create_task(market_monitor.run())
    ws_task = asyncio.create_task(ws_server.run())
    stop_task = asyncio.create_task(stop_event.wait())

    logger.info("sentinel_active", status="monitoring", ws_port=args.port)

    try:
        # Run until stop_event is set or monitors finish
        # Note: we use a loop here because perp_task might be swapped
        while not stop_event.is_set():
            perp_task = perp_task_container[0]
            done, pending = await asyncio.wait(
                [perp_task, market_task, ws_task, stop_task],
                return_when=asyncio.FIRST_COMPLETED
            )
            
            if stop_event.is_set():
                break

            for task in done:
                name = "unknown"
                if task == perp_task: name = "perp_task"
                elif task == market_task: name = "market_task"
                elif task == ws_task: name = "ws_task"
                elif task == stop_task: name = "stop_task"
                
                if task.cancelled():
                    logger.info("task_cancelled", task=name)
                elif task.exception():
                    logger.error("task_failed", task=name, error=str(task.exception()))
                else:
                    logger.info("task_finished", task=name)
                
                # If it wasn't the perp_task (which we handle via subscription), 
                # or if perp_task finished naturally, we might want to exit or restart
                if task != perp_task:
                    stop_event.set()
    finally:
        if perp_task_container[0]:
            perp_task_container[0].cancel()
        market_task.cancel()
        ws_task.cancel()
        stop_task.cancel()
        logger.info("agent_shutdown_complete")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
