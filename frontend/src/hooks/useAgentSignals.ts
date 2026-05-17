'use client';

import { useEffect, useState } from 'react';

export interface AgentSignal {
  event_type: 'PositionUpdate' | 'RiskVerdict' | 'ReasoningTrace' | 'RescueComplete' | 'RescueInitiated' | 'SystemError';
  payload: any;
  timestamp: number;
}

export function useAgentSignals(url: string = 'ws://localhost:8765') {
  const [signals, setSignals] = useState<AgentSignal[]>([]);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');

  useEffect(() => {
    let ws: WebSocket;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      setStatus('connecting');
      ws = new WebSocket(url);

      ws.onopen = () => {
        setStatus('connected');
        console.log('🛡️ GLASS: Connected to Sentinel Bridge');
      };

      ws.onmessage = (event) => {
        try {
          const rawMessage = JSON.parse(event.data);
          // Bridge sends { type, data, timestamp }, we map to { event_type, payload, timestamp }
          const signal: AgentSignal = {
            event_type: rawMessage.type,
            payload: rawMessage.data,
            timestamp: rawMessage.timestamp * 1000 // Ensure ms
          };
          setSignals((prev) => [signal, ...prev].slice(0, 100));
        } catch (err) {
          console.error('🛡️ GLASS: Failed to parse signal', err);
        }
      };

      ws.onclose = () => {
        setStatus('disconnected');
        reconnectTimeout = setTimeout(connect, 3000); // Exponential backoff would be better for production
      };
    };

    connect();

    return () => {
      ws.close();
      clearTimeout(reconnectTimeout);
    };
  }, [url]);

  return { signals, status };
}
