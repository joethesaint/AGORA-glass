import polars as pl
from typing import Dict, List, Optional
from datetime import datetime
import logging

class RiskAnalytics:
    """
    High-performance risk analytics using Polars.
    Calculates rolling volatility, drawdowns, and risk trends from event streams.
    """

    def __init__(self, window_size: int = 100):
        self.logger = logging.getLogger("RiskAnalytics")
        self.window_size = window_size
        # Store raw history in a simple list, then convert to Polars for computation
        self.history: List[Dict] = []
        self.df: Optional[pl.DataFrame] = None

    def add_data_point(self, symbol: str, margin_ratio: float, leverage: float):
        """Adds a new data point to the history."""
        self.history.append({
            "timestamp": datetime.now(),
            "symbol": symbol,
            "margin_ratio": margin_ratio,
            "leverage": leverage
        })
        
        # Prune history to keep it efficient
        if len(self.history) > self.window_size * 2:
            self.history = self.history[-self.window_size:]

    def get_rolling_stats(self, symbol: str) -> Dict:
        """
        Computes rolling statistics for a symbol using Polars.
        Returns mean margin, max leverage, and volatility (std dev).
        """
        if not self.history:
            return {}

        # Convert to Polars DataFrame
        df = pl.DataFrame(self.history).filter(pl.col("symbol") == symbol)
        
        if df.is_empty():
            return {}

        # Perform high-performance aggregations
        stats = df.select([
            pl.col("margin_ratio").mean().alias("avg_margin"),
            pl.col("margin_ratio").std().alias("margin_volatility"),
            pl.col("leverage").max().alias("max_leverage"),
            pl.col("margin_ratio").count().alias("sample_count")
        ]).to_dicts()[0]

        return stats

    def is_trend_deteriorating(self, symbol: str, threshold: float = -0.05) -> bool:
        """
        Detects if the margin ratio is trending downwards using linear regression or simple delta.
        Returns True if the trend is negative and exceeds the threshold.
        """
        if len(self.history) < 10:
            return False

        df = pl.DataFrame(self.history).filter(pl.col("symbol") == symbol)
        if len(df) < 10:
            return False

        # Calculate delta between recent and older window
        recent = df.tail(5).select(pl.col("margin_ratio").mean()).item()
        older = df.head(5).select(pl.col("margin_ratio").mean()).item()
        
        delta = recent - older
        return delta < threshold

# Singleton instance
analytics = RiskAnalytics()
