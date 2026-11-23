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
  updateMarketIntelligence: (regime: string, symbolVolatility: { symbol: string, factor: number } | null) => void;
  updateLatestTrade: (trade: any) => void;
  updateLatestReasoningTrace: (trace: any) => void;
  addMarginHistory: (timestamp: number, ratio: number) => void;
  addLeverageHistory: (timestamp: number, leverage: number) => void;
  setHistory: (margin: { timestamp: number, ratio: number }[], leverage: { timestamp: number, leverage: number }[]) => void;
  setInitialPositions: (positions: Record<string, any>) => void;
  updateLivePosition: (symbol: string, data: any) => void;
  
  // High-performance centralized signal tracking
  signals: any[];
  lastSignal: any | null;
  wsStatus: 'connecting' | 'connected' | 'disconnected';
  addSignal: (signal: any) => void;
  setWsStatus: (status: 'connecting' | 'connected' | 'disconnected') => void;
}

export const useAnalyticsStore = create<AnalyticsStore>((set) => ({
  rescueMetrics: {
    totalRescued: 3500,
    avgLatency: 312,
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
  marginHistory: Array.from({ length: 15 }, (_, i) => ({
    timestamp: Date.now() - (15 - i) * 60 * 1000,
    ratio: 0.28 + Math.sin(i / 2) * 0.02,
  })),
  leverageHistory: Array.from({ length: 15 }, (_, i) => ({
    timestamp: Date.now() - (15 - i) * 60 * 1000,
    leverage: 3.2 + Math.cos(i / 2) * 0.1,
  })),
  livePositions: {
    'BTC': {
      id: 'pos_mock_btc',
      symbol: 'BTC',
      entryPrice: 63200,
      currentPrice: 63200,
      size: 1.5,
      marginRatio: 0.28,
      leverage: 3.2,
      collateral: 30000,
      unrealizedPnL: 0,
      side: 'LONG',
    },
    'ETH': {
      id: 'pos_mock_eth',
      symbol: 'ETH',
      entryPrice: 3400,
      currentPrice: 3400,
      size: 15.0,
      marginRatio: 0.30,
      leverage: 3.0,
      collateral: 17000,
      unrealizedPnL: 0,
      side: 'LONG',
    },
    'SOL': {
      id: 'pos_mock_sol',
      symbol: 'SOL',
      entryPrice: 150,
      currentPrice: 150,
      size: 150.0,
      marginRatio: 0.25,
      leverage: 3.5,
      collateral: 6500,
      unrealizedPnL: 0,
      side: 'LONG',
    }
  },
  signals: [],
  lastSignal: null,
  wsStatus: 'disconnected',
  addSignal: (signal) => set((state) => ({
    signals: [signal, ...state.signals].slice(0, 50),
    lastSignal: signal
  })),
  setWsStatus: (status) => set({ wsStatus: status }),
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
    set((state) => {
      const last = state.marginHistory[state.marginHistory.length - 1];
      if (last && (timestamp - last.timestamp < 1000)) {
        const updated = [...state.marginHistory];
        updated[updated.length - 1] = { ...last, ratio };
        return { marginHistory: updated };
      }
      return {
        marginHistory: [...state.marginHistory.slice(-49), { timestamp, ratio }],
      };
    }),
  addLeverageHistory: (timestamp, leverage) =>
    set((state) => {
      const last = state.leverageHistory[state.leverageHistory.length - 1];
      if (last && (timestamp - last.timestamp < 1000)) {
        const updated = [...state.leverageHistory];
        updated[updated.length - 1] = { ...last, leverage };
        return { leverageHistory: updated };
      }
      return {
        leverageHistory: [...state.leverageHistory.slice(-49), { timestamp, leverage }],
      };
    }),
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
            currentPrice: data.current_price !== undefined ? data.current_price : (existing?.currentPrice || 0),
            marginRatio: data.margin_ratio !== undefined ? data.margin_ratio : (existing?.marginRatio || 0),
            leverage: data.leverage !== undefined ? data.leverage : (existing?.leverage || 0),
            collateral: data.collateral !== undefined ? data.collateral : (existing?.collateral || 0),
            unrealizedPnL: data.unrealized_pnl !== undefined 
              ? data.unrealized_pnl 
              : (data.current_price !== undefined && existing)
                ? (data.current_price - existing.entryPrice) * existing.size
                : (existing?.unrealizedPnL || 0)
          }
        }
      };
    })
}));
