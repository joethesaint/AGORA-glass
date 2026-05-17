import asyncio
import json
import websockets
from typing import Set
from src.base import BaseComponent
from src.events import PositionUpdate, RiskVerdict, ReasoningTrace, RescueComplete, WSSignal
from src.log_config import get_logger

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
        """Callback for all subscribed events; broadcasts them to all connected clients."""
        if not self.clients:
            return

        # Prepare payload
        payload = {
            "type": event.__class__.__name__,
            "data": self._serialize_event(event),
            "timestamp": getattr(event, "timestamp", None),
        }
        
        message = json.dumps(payload)
        
        # Broadcast to all clients
        disconnected = set()
        for client in self.clients:
            try:
                await client.send(message)
            except websockets.exceptions.ConnectionClosed:
                disconnected.add(client)
        
        # Cleanup disconnected clients
        for client in disconnected:
            self.clients.remove(client)

    def _serialize_event(self, event):
        """Converts dataclass event to a dictionary, handling nested objects."""
        import dataclasses
        return dataclasses.asdict(event)

    async def register(self, websocket):
        """Registers a new client connection."""
        self.clients.add(websocket)
        self.logger.info("client_connected", total_clients=len(self.clients))
        try:
            await websocket.wait_closed()
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
