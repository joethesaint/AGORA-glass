import time
from src.base import BaseComponent
from src.events import ReasoningTrace, RescueComplete, WSSignal

class GlassBoxAnalytics(BaseComponent):
    """
    Tracks and publishes real-time safety metrics for the AGORA-glass dashboard.
    Demonstrates 'Agentic Sophistication' to hackathon judges.
    """

    def __init__(self):
        super().__init__("AnalyticsEngine")
        self.total_rescued_usdc = 0.0
        self.rescue_count = 0
        self.latency_history = []
        self.start_time = time.time()
        
        # In-flight traces to measure latency
        self._pending_traces = {} # reason_hash -> timestamp

        # Subscribe to signals
        self.subscribe(ReasoningTrace, self.on_trace)
        self.subscribe(RescueComplete, self.on_rescue)

    async def on_trace(self, event: ReasoningTrace):
        """Track the start of a rescue cycle."""
        self._pending_traces[event.reason_hash] = time.time()
        await self._publish_metrics()

    async def on_rescue(self, event: RescueComplete):
        """Finalize rescue metrics on completion."""
        if event.status == "SUCCESS":
            self.total_rescued_usdc += event.amount
            self.rescue_count += 1
            
            # Calculate latency (Glass-Box Performance)
            start_ts = self._pending_traces.pop(event.reason_hash, None)
            if start_ts:
                latency = (time.time() - start_ts) * 1000 # ms
                self.latency_history.append(latency)
                self.logger.info("rescue_latency_measured", 
                                 reason_hash=event.reason_hash, 
                                 latency_ms=round(latency, 2))

        await self._publish_metrics()

    async def _publish_metrics(self):
        """Broadcasts aggregated analytics to the WebSocket bridge."""
        avg_latency = sum(self.latency_history) / len(self.latency_history) if self.latency_history else 0
        uptime = time.time() - self.start_time

        metrics = {
            "total_rescued_usdc": self.total_rescued_usdc,
            "rescue_count": self.rescue_count,
            "avg_latency_ms": round(avg_latency, 2),
            "protection_uptime_sec": int(uptime),
            "agent_status": "ACTIVE"
        }

        await self.publish(WSSignal(
            event_type="ANALYTICS_UPDATE",
            payload=metrics
        ))

# Instantiate singleton
analytics = GlassBoxAnalytics()
