/**
 * WebSocket Event Types for AGORA-glass Agent
 * These match the events published by the Python agent's MessageBus
 */

export interface PositionUpdate {
  symbol: string;
  margin_ratio: number;
  leverage: number;
  account: string;
  timestamp: string;
}

export interface RiskVerdict {
  status: 'SAFE' | 'CRITICAL';
  margin: number;
  leverage: number;
  symbol: string;
  risk_rating: number;
  account: string;
  timestamp: string;
}

export interface ReasoningTrace {
  agent_id: string;
  action: string;
  account: string;
  leverage_before: number;
  margin_ratio: number;
  rescue_amount_usdc: number;
  evidence: string[];
  risk_rating: string;
  reason_hash: string;
  reasoning_text: string;
  timestamp: string;
}

export interface RescueComplete {
  status: 'SUCCESS' | 'FAILED';
  tx_hash: string;
  amount: number;
  reason_hash: string;
  timestamp: string;
}

export interface MarketVolatilityUpdate {
  symbol: string;
  volatility_factor: number;
  timestamp: string;
}

export interface MarketRegimeUpdate {
  regime: 'RISK_ON' | 'RISK_OFF' | 'EXTREME_VOLATILITY';
  sentiment_score: number;
  timestamp: string;
}

export interface RescueOptimization {
  account: string;
  optimized_amount_usdc: number;
  allocation_rationale: string;
  timestamp: string;
}

export interface TradingSignal {
  symbol: string;
  action: 'BUY' | 'SELL' | 'DE_RISK';
  reason: string;
  amount: number;
  price: number;
  timestamp: string;
}

export type WebSocketEvent =
  | { type: 'PositionUpdate'; data: PositionUpdate; timestamp: string }
  | { type: 'RiskVerdict'; data: RiskVerdict; timestamp: string }
  | { type: 'ReasoningTrace'; data: ReasoningTrace; timestamp: string }
  | { type: 'RescueComplete'; data: RescueComplete; timestamp: string }
  | { type: 'MarketVolatilityUpdate'; data: MarketVolatilityUpdate; timestamp: string }
  | { type: 'MarketRegimeUpdate'; data: MarketRegimeUpdate; timestamp: string }
  | { type: 'RescueOptimization'; data: RescueOptimization; timestamp: string }
  | { type: 'TradingSignal'; data: TradingSignal; timestamp: string };

export interface DashboardState {
  currentPosition: PositionUpdate | null;
  latestRiskVerdict: RiskVerdict | null;
  latestReasoningTrace: ReasoningTrace | null;
  rescueHistory: RescueComplete[];
  positionHistory: PositionUpdate[];
  volatility: Record<string, number>;
  marketRegime: string;
  tradingSignals: TradingSignal[];
  isConnected: boolean;
}
