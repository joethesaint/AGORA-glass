import logging
import sys
from src.bus import bus

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
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
        self.logger.info(f"Component '{name}' initialized.")

    def subscribe(self, topic: str, callback):
        """Standardized subscription via the global bus."""
        self.bus.subscribe(topic, callback)
        self.logger.debug(f"Subscribed to topic: {topic}")

    async def publish(self, topic: str, data: dict):
        """Standardized publishing via the global bus."""
        self.logger.debug(f"Publishing to {topic}: {data}")
        await self.bus.publish(topic, data)
