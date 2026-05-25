import time
import polars as pl
from collections import deque
from datetime import datetime
from src.base import BaseComponent
from src.events import ReasoningTrace, RescueComplete, WSSignal, PositionUpdate

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
            "latency_ms": pl.Series([], dtype=pl.Float64),
            "success": pl.Series([], dtype=pl.Boolean)
        })
        
        self.start_time = time.time()
        self._pending_traces = {} # reason_hash -> timestamp

        # Subscribe to signals
        self.subscribe(ReasoningTrace, self.on_trace)
        self.subscribe(RescueComplete, self.on_rescue)
        self.subscribe(PositionUpdate, self.on_position)
        self._position_history = {} # symbol -> Deque[(float, float)] (timestamp, ratio)
        self._leverage_history = {} # symbol -> Deque[(float, float)] (timestamp, leverage)
        self._latest_positions = {} # symbol -> PositionUpdate
        self._event_history = deque(maxlen=100) # List of recent events

    def reset(self):
        """Resets the analytics state (primarily for testing)."""
        self.metrics_df = self.metrics_df.slice(0, 0)
        self._position_history = {}
        self._leverage_history = {}
        self._latest_positions = {}
        self._event_history = deque(maxlen=100)
        self._pending_traces = {}
        self.start_time = time.time()

    def on_position(self, event: PositionUpdate):
        self._latest_positions[event.symbol] = event
        self._event_history.append(event)
        if event.symbol not in self._position_history:
            self._position_history[event.symbol] = deque(maxlen=50)
            self._leverage_history[event.symbol] = deque(maxlen=50)
        
        ts = event.timestamp
        self._position_history[event.symbol].append((ts, event.margin_ratio))
        self._leverage_history[event.symbol].append((ts, event.leverage))

    def get_history(self):
        """Returns the full available history and current state."""
        return {
            "margin": {s: list(h) for s, h in self._position_history.items()},
            "leverage": {s: list(h) for s, h in self._leverage_history.items()},
            "positions": {s: self._serialize_position(p) for s, p in self._latest_positions.items()},
            "events": [self._serialize_event_item(e) for e in self._event_history]
        }

    def _serialize_event_item(self, e):
        import dataclasses
        return {
            "type": e.__class__.__name__,
            "data": dataclasses.asdict(e),
            "timestamp": getattr(e, "timestamp", None)
        }

    def _serialize_position(self, p: PositionUpdate):
        import dataclasses
        return dataclasses.asdict(p)

    def is_trend_deteriorating(self, symbol: str) -> bool:
        """Checks if margin ratio is consistently decreasing."""
        history_data = list(self._position_history.get(symbol, []))
        if len(history_data) < 10:
            return False
        
        history = [h[1] for h in history_data]
        # Simple trend check: is the average of the last 5 points significantly lower than the average of the older points?
        older_avg = sum(history[:5]) / 5
        recent_avg = sum(history[-5:]) / 5
        return (older_avg - recent_avg) > 0.05

    def get_rolling_stats(self, symbol: str) -> dict:
        """Returns basic stats for the dashboard."""
        history_data = list(self._position_history.get(symbol, []))
        if not history_data:
            return {"avg_margin": 0}
        
        history = [h[1] for h in history_data]
        return {"avg_margin": sum(history) / len(history)}

    async def on_trace(self, event: ReasoningTrace):
        """Track the start of a rescue cycle."""
        self._event_history.append(event)
        self._pending_traces[event.reason_hash] = time.time()

    async def on_rescue(self, event: RescueComplete):
        """Finalize rescue metrics on completion using Polars."""
        self._event_history.append(event)
        self.logger.info("rescue_received", rescue_event=event)
        latency = event.latency_ms
        is_success = event.status == "SUCCESS"
        
        start_ts = self._pending_traces.pop(event.reason_hash, None)
        if start_ts and is_success:
            latency = (time.time() - start_ts) * 1000 # ms
        
        # Append new record to Polars DataFrame
        new_record = pl.DataFrame({
            "timestamp": [datetime.fromtimestamp(event.timestamp)],
            "amount": [float(event.amount) if is_success else 0.0],
            "latency_ms": [float(latency) if latency is not None else None],
            "success": [is_success]
        })
        self.metrics_df = pl.concat([self.metrics_df, new_record])
        
        self.logger.info("rescue_recorded", amount=event.amount, latency_ms=latency, success=is_success)

        await self._publish_metrics()

    async def _publish_metrics(self):
        """Broadcasts aggregated analytics via Polars to the WebSocket bridge."""
        if self.metrics_df.is_empty():
            metrics = {
                "total_rescued_usdc": 0.0,
                "rescue_count": 0,
                "avg_latency_ms": 0.0,
                "success_rate": 100.0,
                "protection_uptime_sec": int(time.time() - self.start_time),
                "agent_status": "ACTIVE"
            }
        else:
            # Use a rolling window (last 10 rescues) for the dashboard average to show performance gains
            rolling_window = 10
            recent_df = self.metrics_df.tail(rolling_window)
            success_count = self.metrics_df["success"].sum()
            total_count = self.metrics_df.shape[0]
            
            metrics = {
                "total_rescued_usdc": self.metrics_df["amount"].sum(),
                "rescue_count": total_count,
                "avg_latency_ms": round(recent_df["latency_ms"].mean() or 0.0, 2),
                "success_rate": round((success_count / total_count) * 100, 2) if total_count > 0 else 100.0,
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
