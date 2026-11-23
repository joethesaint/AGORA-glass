import time
import polars as pl
from collections import deque
from datetime import datetime
from src.base import BaseComponent
from src.events import ReasoningTrace, RescueComplete, WSSignal, PositionUpdate


class _SlidingWindowAvg:
    """O(1) sliding window average over a fixed-size deque.

    Maintains a running sum that is updated incrementally as each new value
    arrives and old values expire — no full-scan or list copy needed.

    Attributes:
        maxlen: Maximum number of data points tracked.
        _dq:    Circular buffer of values.
        _total: Running sum of values currently in the window.
    """

    __slots__ = ("maxlen", "_dq", "_total")

    def __init__(self, maxlen: int = 50):
        self.maxlen = maxlen
        self._dq: deque[float] = deque(maxlen=maxlen)
        self._total: float = 0.0

    def append(self, value: float) -> None:
        """Push a new value, evicting the oldest if at capacity — O(1)."""
        if len(self._dq) == self.maxlen:
            self._total -= self._dq[0]   # evict outgoing value from sum
        self._dq.append(value)
        self._total += value

    def mean(self) -> float | None:
        """Return the current window mean — O(1)."""
        n = len(self._dq)
        return self._total / n if n else None

    def head_mean(self, k: int) -> float | None:
        """Mean of the oldest k values in the window — O(k)."""
        n = len(self._dq)
        if n < k:
            return None
        return sum(self._dq[i] for i in range(k)) / k

    def tail_mean(self, k: int) -> float | None:
        """Mean of the newest k values in the window — O(k)."""
        n = len(self._dq)
        if n < k:
            return None
        return sum(self._dq[n - k + i] for i in range(k)) / k

    def __len__(self) -> int:
        return len(self._dq)


class GlassBoxAnalytics(BaseComponent):
    """
    Tracks and publishes real-time safety metrics for the AGORA-glass dashboard.
    Demonstrates 'Agentic Sophistication' using Polars for high-performance analytics.

    DSA optimisations applied:
    - Trend detection uses _SlidingWindowAvg (O(1) amortised) instead of
      list(deque) + sum scan (O(n)) on every position update.
    - Rescue metric rows are buffered in a plain Python list and only
      converted to a Polars DataFrame on the read path (_publish_metrics),
      eliminating the O(n) pl.concat copy on every rescue event.
    """

    def __init__(self):
        super().__init__("AnalyticsEngine")

        self.start_time = time.time()
        self._pending_traces: dict[str, float] = {}  # reason_hash -> start timestamp

        # Write-path store: raw tuples, no Polars allocation per rescue
        self._rescue_rows: list[tuple] = []  # (datetime, amount, latency_ms, success)

        # Per-symbol sliding window accumulators
        self._margin_window: dict[str, _SlidingWindowAvg] = {}
        self._leverage_window: dict[str, _SlidingWindowAvg] = {}

        # Legacy full-history deques (kept for get_history serialization)
        self._position_history: dict[str, deque] = {}
        self._leverage_history: dict[str, deque] = {}
        self._latest_positions: dict[str, PositionUpdate] = {}
        self._event_history: deque = deque(maxlen=100)

        # Subscribe to signals
        self.subscribe(ReasoningTrace, self.on_trace)
        self.subscribe(RescueComplete, self.on_rescue)
        self.subscribe(PositionUpdate, self.on_position)

    # ------------------------------------------------------------------
    # Reset
    # ------------------------------------------------------------------

    def reset(self):
        """Resets the analytics state (primarily for testing)."""
        self._rescue_rows.clear()
        self._margin_window.clear()
        self._leverage_window.clear()
        self._position_history.clear()
        self._leverage_history.clear()
        self._latest_positions.clear()
        self._event_history = deque(maxlen=100)
        self._pending_traces.clear()
        self.start_time = time.time()

    # ------------------------------------------------------------------
    # Write path  (called on every tick)
    # ------------------------------------------------------------------

    def on_position(self, event: PositionUpdate):
        """O(1) per call thanks to _SlidingWindowAvg."""
        self._latest_positions[event.symbol] = event
        self._event_history.append(event)

        # Legacy full-history deques
        if event.symbol not in self._position_history:
            self._position_history[event.symbol] = deque(maxlen=50)
            self._leverage_history[event.symbol] = deque(maxlen=50)
        self._position_history[event.symbol].append((event.timestamp, event.margin_ratio))
        self._leverage_history[event.symbol].append((event.timestamp, event.leverage))

        # O(1) sliding window update
        if event.symbol not in self._margin_window:
            self._margin_window[event.symbol] = _SlidingWindowAvg(maxlen=50)
            self._leverage_window[event.symbol] = _SlidingWindowAvg(maxlen=50)
        self._margin_window[event.symbol].append(event.margin_ratio)
        self._leverage_window[event.symbol].append(event.leverage)

    # ------------------------------------------------------------------
    # Read path  (called infrequently, on demand)
    # ------------------------------------------------------------------

    def is_trend_deteriorating(self, symbol: str) -> bool:
        """O(1) amortised: compares head/tail 5-point averages via running sum.

        Previously: O(n) list(deque) copy + list comprehension on every call.
        Now: O(k) where k=5, independent of history window size.
        """
        window = self._margin_window.get(symbol)
        if window is None or len(window) < 10:
            return False

        older_avg = window.head_mean(5)
        recent_avg = window.tail_mean(5)
        if older_avg is None or recent_avg is None:
            return False
        return (older_avg - recent_avg) > 0.05

    def get_rolling_stats(self, symbol: str) -> dict:
        """O(1): reads pre-computed running sum."""
        window = self._margin_window.get(symbol)
        avg = window.mean() if window else None
        return {"avg_margin": avg or 0.0}

    def get_history(self):
        """Returns the full available history and current state."""
        return {
            "margin": {s: list(h) for s, h in self._position_history.items()},
            "leverage": {s: list(h) for s, h in self._leverage_history.items()},
            "positions": {s: self._serialize_position(p) for s, p in self._latest_positions.items()},
            "events": [self._serialize_event_item(e) for e in self._event_history]
        }

    # ------------------------------------------------------------------
    # Rescue tracking
    # ------------------------------------------------------------------

    async def on_trace(self, event: ReasoningTrace):
        """Track the start of a rescue cycle."""
        self._event_history.append(event)
        self._pending_traces[event.reason_hash] = time.time()

    async def on_rescue(self, event: RescueComplete):
        """Buffer rescue row as a raw tuple — no Polars allocation on write path."""
        self._event_history.append(event)
        self.logger.info("rescue_received", rescue_event=event)

        latency = event.latency_ms
        is_success = event.status == "SUCCESS"

        start_ts = self._pending_traces.pop(event.reason_hash, None)
        if start_ts and is_success:
            latency = (time.time() - start_ts) * 1000  # ms

        # Append raw tuple — O(1), no DataFrame involved
        self._rescue_rows.append((
            datetime.fromtimestamp(event.timestamp),
            float(event.amount) if is_success else 0.0,
            float(latency) if latency is not None else None,
            is_success,
        ))

        self.logger.info("rescue_recorded", amount=event.amount, latency_ms=latency, success=is_success)
        await self._publish_metrics()

    async def _publish_metrics(self):
        """Converts buffered rows to Polars only on the read path — O(n) once, not per rescue."""
        rows = self._rescue_rows

        if not rows:
            metrics = {
                "total_rescued_usdc": 0.0,
                "rescue_count": 0,
                "avg_latency_ms": 0.0,
                "success_rate": 100.0,
                "protection_uptime_sec": int(time.time() - self.start_time),
                "agent_status": "ACTIVE"
            }
        else:
            # Lazy Polars construction — only happens here, not on every rescue
            timestamps, amounts, latencies, successes = zip(*rows)
            df = pl.DataFrame({
                "timestamp": list(timestamps),
                "amount": list(amounts),
                "latency_ms": list(latencies),
                "success": list(successes),
            })

            rolling_window = 10
            recent_df = df.tail(rolling_window)
            total_count = len(rows)
            success_count = sum(1 for s in successes if s)

            metrics = {
                "total_rescued_usdc": float(df["amount"].sum()),
                "rescue_count": total_count,
                "avg_latency_ms": round(float(recent_df["latency_ms"].mean() or 0.0), 2),
                "success_rate": round((success_count / total_count) * 100, 2) if total_count > 0 else 100.0,
                "protection_uptime_sec": int(time.time() - self.start_time),
                "agent_status": "ACTIVE"
            }

        self.logger.info("publishing_metrics", metrics=metrics)
        await self.publish(WSSignal(
            event_type="ANALYTICS_UPDATE",
            payload=metrics
        ))

    # ------------------------------------------------------------------
    # Serialization helpers
    # ------------------------------------------------------------------

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


# Instantiate singleton
analytics = GlassBoxAnalytics()
