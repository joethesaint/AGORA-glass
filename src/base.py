from src.bus import bus
from src.events import BaseEvent
from src.log_config import get_logger
from src.config import settings

class BaseComponent:
    """Base class for all agent components.

    Handles logging and bus integration.

    Attributes:
        name (str): The name of the component for logging purposes.
        agent_id (str): The unique identifier for this agent instance.
        logger (structlog.BoundLogger): Structured logger instance.
        bus (MessageBus): The global message bus instance.
    """

    def __init__(self, name: str):
        """Initializes the component with a name and logger.

        Args:
            name: The display name for this component.
        """
        self.name = name
        self.agent_id = settings.agent_id
        self.logger = get_logger(name).bind(agent_id=self.agent_id)
        self.bus = bus
        self.logger.debug("component_initialized", component=name)

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
