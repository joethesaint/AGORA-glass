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
  // Optional metadata
  side?: 'LONG' | 'SHORT';
  liquidationPrice?: number;
  entryTimestamp?: number;
}
