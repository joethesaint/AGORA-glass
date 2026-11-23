import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PositionHealthCard } from './PositionHealthCard';

// Mock the analytics store hook
vi.mock('@/stores/analyticsStore', () => ({
  useAnalyticsStore: vi.fn(),
}));

import { useAnalyticsStore } from '@/stores/analyticsStore';

describe('PositionHealthCard Threshold Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders "NOMINAL STABILITY" when margin ratio is well above WARNING_THRESHOLD (e.g. 0.35)', () => {
    (useAnalyticsStore as any).mockReturnValue({
      livePositions: {
        'BTC-PERP': { id: '1', symbol: 'BTC-PERP', marginRatio: 0.35, leverage: 2.5, size: 1, collateral: 1000, unrealizedPnL: 50 },
      },
    });

    render(<PositionHealthCard />);
    expect(screen.getByText(/NOMINAL STABILITY/i)).toBeTruthy();
  });

  it('renders "CAUTION: VOLATILE" when margin ratio drops below WARNING_THRESHOLD (0.20) but above CRITICAL_THRESHOLD (0.12)', () => {
    (useAnalyticsStore as any).mockReturnValue({
      livePositions: {
        'ETH-PERP': { id: '2', symbol: 'ETH-PERP', marginRatio: 0.15, leverage: 4.0, size: 10, collateral: 500, unrealizedPnL: -10 },
      },
    });

    render(<PositionHealthCard />);
    expect(screen.getByText(/CAUTION: VOLATILE/i)).toBeTruthy();
  });

  it('renders "CRITICAL RISK DETECTED" when margin ratio drops below CRITICAL_THRESHOLD (0.12)', () => {
    (useAnalyticsStore as any).mockReturnValue({
      livePositions: {
        'SOL-PERP': { id: '3', symbol: 'SOL-PERP', marginRatio: 0.10, leverage: 8.0, size: 50, collateral: 200, unrealizedPnL: -50 },
      },
    });

    render(<PositionHealthCard />);
    expect(screen.getByText(/CRITICAL RISK DETECTED/i)).toBeTruthy();
  });
});
