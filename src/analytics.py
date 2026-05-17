import time
import polars as pl
from datetime import datetime
from src.base import BaseComponent
from src.events import ReasoningTrace, RescueComplete, WSSignal

class GlassBoxAnalytics(BaseComponent):
    """
    Tracks and publishes real-time safety metrics for the AGORA-glass dashboard.
    Demonstrates 'Agentic Sophistication' using Polars for high-performance analytics.
    """

    def __init__(self):
        super().__init__("AnalyticsEngine")
        
        # Initialize Polars DataFrames for tracking
        self.metrics_df = pl.DataFrame({
            "timestamp": pl.Series([], dtype=pl.Datetime),
            "amount": pl.Series([], dtype=pl.Float64),
            "latency_ms": pl.Series([], dtype=pl.Float64)
        })
        
        self.start_time = time.time()
        self._pending_traces = {} # reason_hash -> timestamp

        # Subscribe to signals
        self.subscribe(ReasoningTrace, self.on_trace)
        self.subscribe(RescueComplete, self.on_rescue)

    async def on_trace(self, event: ReasoningTrace):
        """Track the start of a rescue cycle."""
        self._pending_traces[event.reason_hash] = time.time()

    async def on_rescue(self, event: RescueComplete):
        """Finalize rescue metrics on completion using Polars."""
        self.logger.info("rescue_received", rescue_event=event)
        latency = None
        if event.status == "SUCCESS":
            start_ts = self._pending_traces.pop(event.reason_hash, None)
            if start_ts:
                latency = (time.time() - start_ts) * 1000 # ms
            
            # Append new record to Polars DataFrame
            new_record = pl.DataFrame({
                "timestamp": [datetime.fromtimestamp(event.timestamp)],
                "amount": [event.amount],
                "latency_ms": [latency]
            })
            self.metrics_df = pl.concat([self.metrics_df, new_record])
            
            self.logger.info("rescue_recorded", amount=event.amount, latency_ms=latency)

        await self._publish_metrics()

    async def _publish_metrics(self):
        """Broadcasts aggregated analytics via Polars to the WebSocket bridge."""
        if self.metrics_df.is_empty():
            metrics = {
                "total_rescued_usdc": 0.0,
                "rescue_count": 0,
                "avg_latency_ms": 0.0,
                "protection_uptime_sec": int(time.time() - self.start_time),
                "agent_status": "ACTIVE"
            }
        else:
            metrics = {
                "total_rescued_usdc": self.metrics_df["amount"].sum(),
                "rescue_count": self.metrics_df.shape[0],
                "avg_latency_ms": round(self.metrics_df["latency_ms"].mean(), 2),
                "protection_uptime_sec": int(time.time() - self.start_time),
                "agent_status": "ACTIVE"
            }

        self.logger.info("publishing_metrics", metrics=metrics)
        await self.publish(WSSignal(
            event_type="ANALYTICS_UPDATE",
            payload=metrics
        ))

# Instantiate singleton
analytics = GlassBoxAnalytics()

