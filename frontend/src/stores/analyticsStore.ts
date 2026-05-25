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
  setHistory: (margin: { timestamp: number, ratio: number }[], leverage: { timestamp: number, leverage: number }[]) => void;
  setInitialPositions: (positions: Record<string, any>) => void;
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
  livePositions: {},
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
      marginHistory: [...state.marginHistory.slice(-49), { timestamp, ratio }],
    })),
  addLeverageHistory: (timestamp, leverage) =>
    set((state) => ({
      leverageHistory: [...state.leverageHistory.slice(-49), { timestamp, leverage }],
    })),
  setHistory: (margin, leverage) =>
    set(() => ({
      marginHistory: margin,
      leverageHistory: leverage
    })),
  setInitialPositions: (positions) =>
    set(() => {
        const livePositions: Record<string, Position> = {};
        Object.entries(positions).forEach(([symbol, data]: [string, any]) => {
            livePositions[symbol] = {
                id: `pos_init_${symbol}`,
                symbol,
                entryPrice: data.current_price || 0,
                currentPrice: data.current_price || 0,
                size: data.size || 0,
                marginRatio: data.margin_ratio || 0,
                leverage: data.leverage || 0,
                collateral: data.collateral || 0,
                unrealizedPnL: data.unrealized_pnl || 0,
                side: data.side || 'LONG'
            };
        });
        return { livePositions };
    }),
  updateLivePosition: (symbol, data) =>
    set((state) => {
        const existing = state.livePositions[symbol];
        
        return {
            livePositions: {
                ...state.livePositions,
                [symbol]: {
                    ...(existing || {
                        id: `pos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        symbol,
                        entryPrice: data.current_price || 0,
                        size: data.size || 0,
                        collateral: data.collateral || 0,
                        unrealizedPnL: data.unrealized_pnl || 0,
                        side: data.side || 'LONG'
                    }),
                    currentPrice: data.current_price || existing?.currentPrice || 0,
                    marginRatio: data.margin_ratio || existing?.marginRatio || 0,
                    leverage: data.leverage || existing?.leverage || 0,
                    unrealizedPnL: (data.current_price && existing) 
                        ? (data.current_price - existing.entryPrice) * existing.size
                        : (existing?.unrealizedPnL || 0)
                }
            }
        };
    })
}));
