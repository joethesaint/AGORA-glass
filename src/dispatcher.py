import asyncio
from src.base import BaseComponent

class RescueDispatcher(BaseComponent):
    """
    Executes rescue actions on-chain and via Circle Gateway.
    """
    def __init__(self, agent_address: str):
        super().__init__("RescueDispatcher")
        self.agent_address = agent_address
        self.subscribe("reasoning_trace", self.on_reasoning_trace)

    async def on_reasoning_trace(self, trace: dict):
        self.logger.info(f"Executing rescue for trace {trace['reason_hash']}")
        
        # 1. On-Chain Proof
        await self.pin_to_arc(trace['reason_hash'])
        
        # 2. Financial Action
        await self.execute_circle_rescue(trace['rescue_amount_usdc'])

        # 3. Notification
        await self.publish("rescue_complete", {
            "status": "SUCCESS",
            "hash": trace['reason_hash'],
            "amount": trace['rescue_amount_usdc']
        })

    async def pin_to_arc(self, reason_hash: str):
        self.logger.info(f"Pinning hash {reason_hash} to Arc Network...")
        await asyncio.sleep(0.2) # Simulate fast finality
        self.logger.info("Pinning successful.")

    async def execute_circle_rescue(self, amount: int):
        self.logger.info(f"Moving {amount} USDC via Circle Gateway...")
        await asyncio.sleep(0.3) # Simulate <500ms latency
        self.logger.info("Rescue transfer complete.")

# Instantiate singleton with default address
dispatcher = RescueDispatcher("0x70997970C51812dc3A010C7d01b50e0d17dc79C8")
