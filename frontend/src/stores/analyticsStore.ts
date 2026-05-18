import { create } from 'zustand';

export interface RescueMetrics {
  totalRescued: number;
  avgLatency: number;
  successRate: number;
  totalRescues: number;
  failedRescues: number;
}

export interface PositionMetrics {
  totalValue: number;
  avgMarginRatio: number;
  avgLeverage: number;
  positionCount: number;
  criticalPositions: number;
}

export interface AnalyticsStore {
  rescueMetrics: RescueMetrics;
  positionMetrics: PositionMetrics;
  marginHistory: { timestamp: number; ratio: number }[];
  leverageHistory: { timestamp: number; leverage: number }[];
  updateRescueMetrics: (metrics: Partial<RescueMetrics>) => void;
  updatePositionMetrics: (metrics: Partial<PositionMetrics>) => void;
  addMarginHistory: (timestamp: number, ratio: number) => void;
  addLeverageHistory: (timestamp: number, leverage: number) => void;
}

export const useAnalyticsStore = create<AnalyticsStore>((set) => ({
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
  marginHistory: [
    { timestamp: Date.now() - 60000, ratio: 0.25 },
    { timestamp: Date.now() - 50000, ratio: 0.27 },
    { timestamp: Date.now() - 40000, ratio: 0.30 },
    { timestamp: Date.now() - 30000, ratio: 0.28 },
    { timestamp: Date.now() - 20000, ratio: 0.32 },
    { timestamp: Date.now() - 10000, ratio: 0.28 },
  ],
  leverageHistory: [
    { timestamp: Date.now() - 60000, leverage: 3.5 },
    { timestamp: Date.now() - 50000, leverage: 3.8 },
    { timestamp: Date.now() - 40000, leverage: 3.2 },
    { timestamp: Date.now() - 30000, leverage: 3.1 },
    { timestamp: Date.now() - 20000, leverage: 2.8 },
    { timestamp: Date.now() - 10000, leverage: 3.0 },
  ],
  updateRescueMetrics: (metrics) =>
    set((state) => ({
      rescueMetrics: { ...state.rescueMetrics, ...metrics },
    })),
  updatePositionMetrics: (metrics) =>
    set((state) => ({
      positionMetrics: { ...state.positionMetrics, ...metrics },
    })),
  addMarginHistory: (timestamp, ratio) =>
    set((state) => ({
      marginHistory: [...state.marginHistory.slice(-19), { timestamp, ratio }],
    })),
  addLeverageHistory: (timestamp, leverage) =>
    set((state) => ({
      leverageHistory: [...state.leverageHistory.slice(-19), { timestamp, leverage }],
    })),
}));
