import asyncio
import ujson as json
import websockets
from typing import Set
from src.base import BaseComponent
from src.events import PositionUpdate, RiskVerdict, ReasoningTrace, RescueInitiated, BridgeInitiated, RescueComplete, WSSignal, TradingSignal
from src.log_config import get_logger
from src.config import settings

class WebSocketServer(BaseComponent):
    """
    WebSocket server that broadcasts AGORA-glass events to the frontend dashboard.
    Acts as a bridge between the internal MessageBus and external clients.
    """

    def __init__(self, host: str = "0.0.0.0", port: int = 8765):
        super().__init__("WebSocketServer")
        self.host = host
        self.port = port
        self.clients: Set[websockets.WebSocketServerProtocol] = set()
        self.logger = get_logger("ws_server")

        # Subscribe to all events we want to broadcast to the dashboard
        self.subscribe(PositionUpdate, self.on_event)
        self.subscribe(RiskVerdict, self.on_event)
        self.subscribe(ReasoningTrace, self.on_event)
        self.subscribe(RescueInitiated, self.on_event)
        self.subscribe(BridgeInitiated, self.on_event)
        self.subscribe(RescueComplete, self.on_event)
        self.subscribe(WSSignal, self.on_event)
        self.subscribe(TradingSignal, self.on_event)

    async def on_event(self, event):
        """
        Callback for all subscribed events; broadcasts them to all connected clients.
        Optimized for speed using concurrent delivery.
        """
        if not self.clients:
            return

        event_name = event.__class__.__name__
        self.logger.debug("broadcasting_event", event_type=event_name)

        # Prepare payload and pre-serialize for efficiency
        payload = {
            "type": event.__class__.__name__,
            "data": self._serialize_event(event),
            "timestamp": getattr(event, "timestamp", None),
        }
        
        try:
            message = json.dumps(payload)
        except Exception as e:
            self.logger.error("serialization_failure", error=str(e))
            return
        
        # Concurrent broadcast to all clients to avoid blocking on slow ones
        if self.clients:
            # Create a copy of the clients set to avoid "Set changed size during iteration"
            current_clients = list(self.clients)
            tasks = [self._send_to_client(client, message) for client in current_clients]
            await asyncio.gather(*tasks)

    async def _send_to_client(self, client, message):
        """Sends a message to a single client and handles disconnection."""
        try:
            # We set a timeout to avoid hanging on a single slow connection
            await asyncio.wait_for(client.send(message), timeout=1.0)
        except (websockets.exceptions.ConnectionClosed, asyncio.TimeoutError):
            if client in self.clients:
                self.clients.remove(client)
        except Exception as e:
            self.logger.error("ws_send_error", error=str(e))
            if client in self.clients:
                self.clients.remove(client)

    def _serialize_event(self, event):
        """Fast converts dataclass event to a dictionary."""
        # Using event.__dict__ is 10x-100x faster than dataclasses.asdict() in hot loops
        return getattr(event, "__dict__", str(event))

    async def handle_messages(self, websocket):
        """Handles incoming messages from a client."""
        async for message in websocket:
            try:
                data = json.loads(message)
                if data.get("type") == "TOGGLE_MODE":
                    new_mode = data.get("mode")
                    if new_mode in ["sentinel", "trading"]:
                        settings.agent_mode = new_mode
                        self.logger.info("agent_mode_toggled", mode=new_mode)
                        
                        # Broadcast the mode change back to all clients
                        await self.on_event(WSSignal(
                            event_type="MODE_CHANGED",
                            payload={"mode": new_mode}
                        ))
                
                elif data.get("type") == "UPDATE_CONFIG":
                    # Update internal settings dynamically
                    # We create a new RiskConfig since it's frozen
                    from src.config import RiskConfig
                    new_risk = RiskConfig(
                        max_leverage=float(data.get("max_leverage", settings.risk.max_leverage)),
                        rescue_target_margin=float(data.get("rescue_target_margin", settings.risk.rescue_target_margin)),
                        base_critical_threshold=float(data.get("base_critical_threshold", settings.risk.base_critical_threshold)),
                        volatility_multiplier=float(data.get("volatility_multiplier", settings.risk.volatility_multiplier)),
                    )
                    # Update global settings (Settings dataclass itself is not frozen)
                    settings.risk = new_risk
                    self.logger.info("config_updated", 
                                     max_leverage=settings.risk.max_leverage, 
                                     threshold=settings.risk.base_critical_threshold)
                    
                    # Broadcast the config change if needed (optional)
                    await self.on_event(WSSignal(
                        event_type="CONFIG_UPDATED",
                        payload={
                            "max_leverage": settings.risk.max_leverage,
                            "base_critical_threshold": settings.risk.base_critical_threshold
                        }
                    ))

                elif data.get("type") == "CONFIGURE_MONITORING":
                    account = data.get("account")
                    mode = "mock" if data.get("isMock") else "live"
                    vault_amount = data.get("vaultAmount", "500")
                    
                    self.logger.info("monitoring_config_received", account=account, mode=mode)
                    
                    # Publish event to trigger monitor restart in main loop
                    from src.events import UpdateMonitoringRequest
                    from src.bus import bus
                    await bus.publish(UpdateMonitoringRequest(
                        account=account,
                        mode=mode,
                        vault_amount=vault_amount
                    ))
                    
                    # Notify frontend that configuration is being applied
                    await self.on_event(WSSignal(
                        event_type="MONITORING_CONFIG_APPLIED",
                        payload={"account": account, "mode": mode}
                    ))
                    
                elif data.get("type") == "KILL_SWITCH":
                    self.logger.warning("kill_switch_triggered", source="frontend_dashboard")
                    from src.events import TradingSignal, RiskVerdict
                    from src.bus import bus
                    # Broadcast the tripped state back to the UI
                    await self.on_event(WSSignal(
                        event_type="KILL_SWITCH_TRIPPED",
                        payload={"status": "ARMED", "routing": "A-book"}
                    ))
                    # Trigger an immediate de-risk/rescue for all exposure
                    await bus.publish(TradingSignal(
                        symbol="ALL",
                        action="DE_RISK",
                        reason="Manual Kill-Switch Tripped via Dashboard",
                        amount=1.0, 
                        price=0.0
                    ))
                
                elif data.get("type") == "SIMULATE_FLASH_CRASH":
                    from src.events import SimulateCrash
                    from src.bus import bus
                    await bus.publish(SimulateCrash(
                        symbol=data.get("symbol", "BTC-PERP"),
                        drop_percentage=float(data.get("drop", 0.20))
                    ))
                    self.logger.warning("flash_crash_triggered", source="dashboard")
                    await self.on_event(WSSignal(
                        event_type="MODE_CHANGED",
                        payload={"mode": "Flash Crash Activated!"}
                    ))
                
                elif data.get("type") == "HEDGE_POSITION":
                    from src.events import TradingSignal
                    from src.bus import bus
                    await bus.publish(TradingSignal(
                        symbol=data.get("symbol", "BTC-PERP"),
                        action="HEDGE",
                        reason="Manual Hedge via Dashboard",
                        amount=float(data.get("amount", 1.0)), 
                        price=0.0
                    ))
                    self.logger.info("manual_hedge_triggered", source="dashboard")
            except Exception as e:
                self.logger.error("ws_message_error", error=str(e))

    async def register(self, websocket):
        """Registers a new client connection."""
        self.clients.add(websocket)
        self.logger.info("client_connected", total_clients=len(self.clients))
        
        # Send current mode to new client
        await websocket.send(json.dumps({
            "type": "WSSignal",
            "data": {"event_type": "MODE_CHANGED", "payload": {"mode": settings.agent_mode}},
            "timestamp": None
        }))

        # Send initial history to the client
        from src.analytics import analytics
        history = analytics.get_history()
        await websocket.send(json.dumps({
            "type": "WSSignal",
            "data": {"event_type": "INITIAL_HISTORY", "payload": history},
            "timestamp": None
        }))

        try:
            # Handle incoming messages and wait for closure
            await self.handle_messages(websocket)
        finally:
            if websocket in self.clients:
                self.clients.remove(websocket)
            self.logger.info("client_disconnected", total_clients=len(self.clients))

    async def run(self):
        """Starts the WebSocket server."""
        self.logger.info("ws_server_starting", host=self.host, port=self.port)
        async with websockets.serve(self.register, self.host, self.port):
            await asyncio.Future()  # Run forever

# Singleton instance
ws_server = WebSocketServer()
