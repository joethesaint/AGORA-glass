import asyncio
from src.monitor import PerpMonitor
# Components register themselves via imports
import src.engine      
import src.tracer      
import src.dispatcher  

async def main():
    print("🛡️ AGORA-glass: Glass-Box Sentinel (BaseClass & Logging mode)")
    
    # Initialize components
    monitor = PerpMonitor(mode="mock")
    
    # Start the monitor loop
    await monitor.run()
    
    print("\n✅ Simulation complete.")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n🛑 Sentinel stopped by user.")
