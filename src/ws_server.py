import asyncio
import ujson as json
import websockets
from typing import Set
from src.base import BaseComponent
from src.events import PositionUpdate, RiskVerdict, ReasoningTrace, RescueComplete, WSSignal
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
        self.subscribe(RescueComplete, self.on_event)
        self.subscribe(WSSignal, self.on_event)

    async def on_event(self, event):
        """
        Callback for all subscribed events; broadcasts them to all connected clients.
        Optimized for speed using concurrent delivery.
        """
        if not self.clients:
            return

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
        """Converts dataclass event to a dictionary, handling nested objects."""
        import dataclasses
        return dataclasses.asdict(event)

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
