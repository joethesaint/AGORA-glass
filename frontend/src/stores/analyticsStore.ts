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

export interface Position {
  id: string;
  symbol: string;
  entryPrice: number;
  currentPrice: number;
  size: number;
  marginRatio: number;
  leverage: number;
  collateral: number;
  unrealizedPnL: number;
  side: 'LONG' | 'SHORT';
}

export interface AnalyticsStore {
  rescueMetrics: RescueMetrics;
  positionMetrics: PositionMetrics;
  marketRegime: string;
  volatility: Record<string, number>;
  latestTrade: any | null;
  latestReasoningTrace: any | null;
  marginHistory: { timestamp: number; ratio: number }[];
  leverageHistory: { timestamp: number; leverage: number }[];
  livePositions: Record<string, Position>;
  updateRescueMetrics: (metrics: Partial<RescueMetrics>) => void;
  updatePositionMetrics: (metrics: Partial<PositionMetrics>) => void;
  updateMarketIntelligence: (regime: string, symbolVolatility: {symbol: string, factor: number} | null) => void;
  updateLatestTrade: (trade: any) => void;
  updateLatestReasoningTrace: (trace: any) => void;
  addMarginHistory: (timestamp: number, ratio: number) => void;
  addLeverageHistory: (timestamp: number, leverage: number) => void;
  updateLivePosition: (symbol: string, data: any) => void;
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
  marketRegime: 'STABLE',
  volatility: {},
  latestTrade: null,
  latestReasoningTrace: null,
  marginHistory: [],
  leverageHistory: [],
  livePositions: {
    'BTC-PERP': {
        id: 'pos_001',
        symbol: 'BTC-PERP',
        entryPrice: 60000,
        currentPrice: 63200,
        size: 1.5,
        marginRatio: 0.35,
        leverage: 2.5,
        collateral: 50000,
        unrealizedPnL: 4800,
        side: 'LONG',
    },
    'ETH-PERP': {
        id: 'pos_002',
        symbol: 'ETH-PERP',
        entryPrice: 3000,
        currentPrice: 3150,
        size: 10,
        marginRatio: 0.22,
        leverage: 4.1,
        collateral: 65000,
        unrealizedPnL: 1500,
        side: 'LONG',
    }
  },
  updateRescueMetrics: (metrics) =>
    set((state) => ({
      rescueMetrics: { ...state.rescueMetrics, ...metrics },
    })),
  updatePositionMetrics: (metrics) =>
    set((state) => ({
      positionMetrics: { ...state.positionMetrics, ...metrics },
    })),
  updateMarketIntelligence: (regime, symbolVolatility) =>
    set((state) => ({
      marketRegime: regime,
      volatility: symbolVolatility 
        ? { ...state.volatility, [symbolVolatility.symbol]: symbolVolatility.factor }
        : state.volatility
    })),
  updateLatestTrade: (trade) =>
    set({ latestTrade: trade }),
  updateLatestReasoningTrace: (trace) =>
    set({ latestReasoningTrace: trace }),
  addMarginHistory: (timestamp, ratio) =>
    set((state) => ({
      marginHistory: [...state.marginHistory.slice(-19), { timestamp, ratio }],
    })),
  addLeverageHistory: (timestamp, leverage) =>
    set((state) => ({
      leverageHistory: [...state.leverageHistory.slice(-19), { timestamp, leverage }],
    })),
  updateLivePosition: (symbol, data) =>
    set((state) => {
        const existing = state.livePositions[symbol];
        if (!existing) return state;
        
        return {
            livePositions: {
                ...state.livePositions,
                [symbol]: {
                    ...existing,
                    currentPrice: data.current_price || existing.currentPrice,
                    marginRatio: data.margin_ratio || existing.marginRatio,
                    leverage: data.leverage || existing.leverage,
                    unrealizedPnL: data.current_price 
                        ? (data.current_price - existing.entryPrice) * existing.size
                        : existing.unrealizedPnL
                }
            }
        };
    })
}));
