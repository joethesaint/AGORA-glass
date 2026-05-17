import os
import logging
import sys
from src.bus import bus
from src.events import BaseEvent

# Create logs directory if it doesn't exist
os.makedirs("logs", exist_ok=True)

# Configure logging once
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("logs/agent.log", encoding="utf-8"),
    ],
)


class BaseComponent:
    """Base class for all agent components.

    Handles logging and bus integration.

    Attributes:
        name (str): The name of the component for logging purposes.
        logger (logging.Logger): Logger instance for the component.
        bus (MessageBus): The global message bus instance.
    """

    def __init__(self, name: str):
        """Initializes the component with a name and logger.

        Args:
            name: The display name for this component.
        """
        self.name = name
        self.logger = logging.getLogger(name)
        self.bus = bus
        self.logger.debug(f"Component '{name}' initialized.")

    def subscribe(self, event_type: type[BaseEvent], callback: callable):
        """Subscribes to a specific event type on the global bus.

        Args:
            event_type: The class of the event to listen for.
            callback: The async function to call when an event is published.
        """
        self.bus.subscribe(event_type, callback)

    async def publish(self, event: BaseEvent):
        """Publishes an event to the global message bus.

        Args:
            event: The event instance to broadcast.
        """
        await self.bus.publish(event)
