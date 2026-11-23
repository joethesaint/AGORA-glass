import { describe, it, expect } from 'vitest';
import { useAnalyticsStore } from '../stores/analyticsStore';

describe('AnalyticsStore Synchronization', () => {
  it('should update rescue metrics when updateRescueMetrics is called', () => {
    const store = useAnalyticsStore.getState();

    const newMetrics = {
      totalRescued: 5000,
      avgLatency: 300,
      totalRescues: 70
    };

    useAnalyticsStore.getState().updateRescueMetrics(newMetrics);
    const updatedStore = useAnalyticsStore.getState();

    expect(updatedStore.rescueMetrics.totalRescued).toBe(5000);
    expect(updatedStore.rescueMetrics.avgLatency).toBe(300);
    expect(updatedStore.rescueMetrics.totalRescues).toBe(70);
  });
});
