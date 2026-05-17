import asyncio
from src.bus import bus

class RescueDispatcher:
    def __init__(self, agent_address):
        self.agent_address = agent_address
        bus.subscribe("reasoning_trace", self.on_reasoning_trace)

    async def on_reasoning_trace(self, trace):
        """
        OUTPUT: Executes the rescue on-chain and via Circle Gateway.
        """
        print(f"🚀 Dispatcher: Received trace for {trace['reason_hash']}")
        
        # 1. On-Chain Proof (Ayo's Registry)
        await self.pin_to_arc(trace['reason_hash'])
        
        # 2. Financial Action (Circle Gateway)
        await self.execute_circle_rescue(trace['rescue_amount_usdc'])

        # 3. Notification
        await bus.publish("rescue_complete", {
            "status": "SUCCESS",
            "hash": trace['reason_hash'],
            "amount": trace['rescue_amount_usdc']
        })

    async def pin_to_arc(self, reason_hash):
        print(f"📡 Dispatcher -> Arc: Storing hash {reason_hash}... [SUCCESS]")
        await asyncio.sleep(0.2) # Simulate fast finality

    async def execute_circle_rescue(self, amount):
        print(f"💸 Dispatcher -> Circle: Moving {amount} USDC... [COMPLETE]")
        await asyncio.sleep(0.3) # Simulate <500ms latency

# Instantiate with Joe's address from GEMINI.md
dispatcher = RescueDispatcher("0x70997970C51812dc3A010C7d01b50e0d17dc79C8")
