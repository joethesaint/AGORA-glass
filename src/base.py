import logging
import sys
from src.bus import bus
from src.events import BaseEvent

# Configure logging once
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)

class BaseComponent:
    """
    Base class for all agent components.
    Handles logging and bus integration.
    """
    def __init__(self, name: str):
        self.name = name
        self.logger = logging.getLogger(name)
        self.bus = bus
        self.logger.debug(f"Component '{name}' initialized.")

    def subscribe(self, event_type, callback):
        self.bus.subscribe(event_type, callback)

    async def publish(self, event: BaseEvent):
        await self.bus.publish(event)
