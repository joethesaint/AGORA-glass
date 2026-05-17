import pytest
import asyncio
from src.analytics import RiskAnalytics

def test_analytics_rolling_stats():
    """Verifies that Polars correctly calculates rolling stats."""
    analytics = RiskAnalytics(window_size=10)
    
    # Add data points
    for i in range(1, 6):
        analytics.add_data_point("BTC-PERP", margin_ratio=0.1 * i, leverage=1.0)
        
    stats = analytics.get_rolling_stats("BTC-PERP")
    
    # Avg margin of [0.1, 0.2, 0.3, 0.4, 0.5] = 0.3
    assert stats["avg_margin"] == pytest.approx(0.3)
    assert stats["max_leverage"] == 1.0
    assert stats["sample_count"] == 5

def test_analytics_trend_detection():
    """Verifies that Polars detects deteriorating trends."""
    analytics = RiskAnalytics(window_size=20)
    
    # 1. Stable/Improving Trend
    for i in range(10):
        analytics.add_data_point("BTC-PERP", margin_ratio=0.2, leverage=1.0)
    assert analytics.is_trend_deteriorating("BTC-PERP") is False
    
    # 2. Deteriorating Trend (0.2 -> 0.1)
    # Threshold is -0.05 by default
    analytics.history = [] # Clear
    for i in range(5):
        analytics.add_data_point("BTC-PERP", margin_ratio=0.2, leverage=1.0)
    for i in range(5):
        analytics.add_data_point("BTC-PERP", margin_ratio=0.1, leverage=1.0)
        
    # Delta = 0.1 - 0.2 = -0.1 < -0.05
    assert analytics.is_trend_deteriorating("BTC-PERP") is True

def test_analytics_pruning():
    """Verifies that history is pruned to keep the analytics engine fast."""
    analytics = RiskAnalytics(window_size=5)
    
    # Add 20 points
    for i in range(20):
        analytics.add_data_point("BTC-PERP", 0.1, 1.0)
        
    # Pruning happens when len > window_size * 2 (10)
    # Pruned to window_size (5)
    assert len(analytics.history) <= 10
