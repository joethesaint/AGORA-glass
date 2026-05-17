import asyncio
from src.bus import bus

async def monitor():
    while True:
        await bus.publish("position_update", {"symbol": "BTC", "margin": 0.11})
        await asyncio.sleep(5)

async def engine(data):
    print(f"Engine received: {data}")

async def main():
    bus.subscribe("position_update", engine)
    await monitor()

if __name__ == "__main__":
    asyncio.run(main())
