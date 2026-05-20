import { describe, it, expect, beforeEach } from 'vitest';
import { useAnalyticsStore } from './analyticsStore';

describe('useAnalyticsStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    const state = useAnalyticsStore.getState();
    useAnalyticsStore.setState({
      rescueMetrics: {
        totalRescued: 3500,
        avgLatency: 487,
        successRate: 98.5,
        totalRescues: 67,
        failedRescues: 1,
      },
      positionMetrics: {
        totalValue: 150000,
        avgMarginRatio: 0.28,
        avgLeverage: 3.2,
        positionCount: 3,
        criticalPositions: 0,
      },
    });
  });

  describe('Rescue Metrics', () => {
    it('initializes with default rescue metrics', () => {
      const state = useAnalyticsStore.getState();
      expect(state.rescueMetrics.totalRescued).toBe(3500);
      expect(state.rescueMetrics.avgLatency).toBe(487);
      expect(state.rescueMetrics.successRate).toBe(98.5);
    });

    it('updates rescue metrics', () => {
      const store = useAnalyticsStore.getState();
      store.updateRescueMetrics({ totalRescued: 5000, avgLatency: 450 });
      const updated = useAnalyticsStore.getState();
      expect(updated.rescueMetrics.totalRescued).toBe(5000);
      expect(updated.rescueMetrics.avgLatency).toBe(450);
      expect(updated.rescueMetrics.successRate).toBe(98.5); // unchanged
    });

    it('can update individual rescue metric fields', () => {
      const store = useAnalyticsStore.getState();
      store.updateRescueMetrics({ successRate: 99.9 });
      const updated = useAnalyticsStore.getState();
      expect(updated.rescueMetrics.successRate).toBe(99.9);
      expect(updated.rescueMetrics.totalRescued).toBe(3500); // unchanged
    });
  });

  describe('Position Metrics', () => {
    it('initializes with default position metrics', () => {
      const state = useAnalyticsStore.getState();
      expect(state.positionMetrics.totalValue).toBe(150000);
      expect(state.positionMetrics.avgMarginRatio).toBe(0.28);
      expect(state.positionMetrics.positionCount).toBe(3);
    });

    it('updates position metrics', () => {
      const store = useAnalyticsStore.getState();
      store.updatePositionMetrics({ criticalPositions: 1, positionCount: 4 });
      const updated = useAnalyticsStore.getState();
      expect(updated.positionMetrics.criticalPositions).toBe(1);
      expect(updated.positionMetrics.positionCount).toBe(4);
    });
  });

  describe('Margin History', () => {
    it('initializes with history data', () => {
      const state = useAnalyticsStore.getState();
      expect(state.marginHistory.length).toBeGreaterThan(0);
      expect(state.marginHistory[0]).toHaveProperty('timestamp');
      expect(state.marginHistory[0]).toHaveProperty('ratio');
    });

    it('adds new margin history entry', () => {
      const store = useAnalyticsStore.getState();
      const initialLength = store.marginHistory.length;
      const newTimestamp = Date.now();
      const newRatio = 0.35;

      store.addMarginHistory(newTimestamp, newRatio);

      const updated = useAnalyticsStore.getState();
      expect(updated.marginHistory.length).toBe(initialLength);
      expect(updated.marginHistory[updated.marginHistory.length - 1]).toEqual({
        timestamp: newTimestamp,
        ratio: newRatio,
      });
    });

    it('maintains maximum of 20 margin history entries', () => {
      const store = useAnalyticsStore.getState();
      const initialLength = store.marginHistory.length;

      // Add multiple entries
      for (let i = 0; i < 10; i++) {
        store.addMarginHistory(Date.now() + i * 1000, 0.25 + i * 0.01);
      }

      const updated = useAnalyticsStore.getState();
      expect(updated.marginHistory.length).toBeLessThanOrEqual(20);
    });
  });

  describe('Leverage History', () => {
    it('initializes with history data', () => {
      const state = useAnalyticsStore.getState();
      expect(state.leverageHistory.length).toBeGreaterThan(0);
      expect(state.leverageHistory[0]).toHaveProperty('timestamp');
      expect(state.leverageHistory[0]).toHaveProperty('leverage');
    });

    it('adds new leverage history entry', () => {
      const store = useAnalyticsStore.getState();
      const initialLength = store.leverageHistory.length;
      const newTimestamp = Date.now();
      const newLeverage = 3.5;

      store.addLeverageHistory(newTimestamp, newLeverage);

      const updated = useAnalyticsStore.getState();
      expect(updated.leverageHistory.length).toBe(initialLength);
      expect(updated.leverageHistory[updated.leverageHistory.length - 1]).toEqual({
        timestamp: newTimestamp,
        leverage: newLeverage,
      });
    });

    it('maintains maximum of 20 leverage history entries', () => {
      const store = useAnalyticsStore.getState();

      // Add multiple entries beyond the limit
      for (let i = 0; i < 25; i++) {
        store.addLeverageHistory(Date.now() + i * 1000, 2.5 + i * 0.1);
      }

      const updated = useAnalyticsStore.getState();
      expect(updated.leverageHistory.length).toBeLessThanOrEqual(20);
    });
  });
});
