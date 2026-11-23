import asyncio
from src.base import BaseComponent
from src.events import PositionUpdate

class ExampleAgent(BaseComponent):
    """
    A simple example of a drop-in plugin agent.
    To use this, just drop it in the 'plugins/' folder.
    It will be automatically loaded and subscribed to the message bus.
    """
    def __init__(self):
        super().__init__("ExampleAgent")
        self.subscribe(PositionUpdate, self.on_position)

    async def on_position(self, event: PositionUpdate):
        # Example logic: log every time a position exceeds 10x leverage
        if event.leverage > 10.0:
            self.logger.info(
                f"High leverage detected: {event.symbol} at {event.leverage}x", 
                account=event.account
            )
