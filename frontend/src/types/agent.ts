export type EventType = 
  | 'PositionUpdate' 
  | 'RiskVerdict' 
  | 'ReasoningTrace' 
  | 'RescueInitiated'
  | 'RescueComplete' 
  | 'WSSignal'
  | 'ANALYTICS_UPDATE' // Sub-type for WSSignal
  | 'Unknown';

export interface AgentSignal {
  type: EventType;
  event_type?: string; // For WSSignal normalization
  timestamp: number;
  data: any;
  payload?: any; // For WSSignal normalization
}
