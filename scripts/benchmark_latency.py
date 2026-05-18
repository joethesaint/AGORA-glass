import asyncio
import time
import statistics
import logging
from src.bus import bus
from src.events import RiskVerdict, ReasoningTrace, RescueComplete
from src.engine import engine
from src.tracer import tracer
from src.dispatcher import dispatcher
from src.log_config import configure_logging

# Configure logging to ERROR only to avoid log spam during benchmark
configure_logging()
logging.getLogger().setLevel(logging.ERROR)

class LatencyBenchmark:
    """Benchmarking suite for AGORA-glass end-to-end rescue latency."""

    def __init__(self, iterations: int = 50):
        self.iterations = iterations
        self.latencies = []
        self.start_times = {} # reason_hash -> start_timestamp
        self.pending_verdicts = {} # account -> start_timestamp
        
        # Subscribe to internal events
        bus.subscribe(ReasoningTrace, self.on_reasoning_trace)
        bus.subscribe(RescueComplete, self.on_rescue_complete)

    async def on_reasoning_trace(self, event: ReasoningTrace):
        """Captures the hash from the tracer and maps it to the original start time."""
        if event.account in self.pending_verdicts:
            self.start_times[event.reason_hash] = self.pending_verdicts[event.account]

    async def on_rescue_complete(self, event: RescueComplete):
        """Calculates total end-to-end latency for a specific rescue."""
        if event.reason_hash in self.start_times:
            total_latency = (time.time() - self.start_times[event.reason_hash]) * 1000
            self.latencies.append(total_latency)

    async def run(self):
        print(f"🚀 Starting AGORA-glass Latency Benchmark ({self.iterations} iterations)...")
        print("💡 Simulating CRITICAL risk detections and measuring E2E rescue cycles.")
        
        for i in range(self.iterations):
            account = f"0xBENCH_{i:03d}"
            verdict = RiskVerdict(
                status="CRITICAL",
                margin=0.08, leverage=15.0, symbol="BTC-PERP",
                risk_rating=5, account=account
            )
            
            # Record detection start
            self.pending_verdicts[account] = time.time()
            
            # Publish verdict
            await bus.publish(verdict)
            
            # Small concurrent load simulation
            if i % 10 == 0:
                await asyncio.sleep(0.05)

        # Wait for completion
        print("⏳ Waiting for rescue cycles to settle...")
        await asyncio.sleep(4)
        self.report()

    def report(self):
        if not self.latencies:
            print("❌ No latency data collected. Ensure services are mock-enabled.")
            return

        avg = statistics.mean(self.latencies)
        p95 = statistics.quantiles(self.latencies, n=20)[18] # 95th percentile
        min_lat = min(self.latencies)
        max_lat = max(self.latencies)

        print("\n--- 📊 LATENCY BENCHMARK REPORT ---")
        print(f"Total Cycles:     {len(self.latencies)}")
        print(f"Avg Latency:      {avg:.2f} ms")
        print(f"P95 Latency:      {p95:.2f} ms")
        print(f"Min Latency:      {min_lat:.2f} ms")
        print(f"Max Latency:      {max_lat:.2f} ms")
        print("----------------------------------\n")
        
        if p95 < 500:
            print("✅ PERFORMANCE STATUS: COMPLIANT (<500ms mandate)")
        else:
            print("⚠️ PERFORMANCE STATUS: NON-COMPLIANT (>500ms mandate)")

if __name__ == "__main__":
    benchmark = LatencyBenchmark(iterations=50)
    try:
        asyncio.run(benchmark.run())
    except KeyboardInterrupt:
        pass
