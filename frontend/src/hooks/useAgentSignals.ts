'use client';

import { useEffect, useState } from 'react';
import { AgentSignal, EventType } from '@/types/agent';

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
          const raw = JSON.parse(event.data);
          
          let type = raw.type as EventType;
          let payload = raw.data;
          let event_type = raw.type;

          // Special handling for WSSignal wrapper to flatten it
          if (raw.type === 'WSSignal' && raw.data) {
            type = raw.data.event_type as EventType;
            event_type = raw.data.event_type;
            payload = raw.data.payload;
          }

          const signal: AgentSignal = {
            type,
            event_type,
            timestamp: raw.timestamp || Date.now() / 1000,
            data: payload, // Use flattened payload as data for components
            payload,
          };

          setSignals((prev) => [signal, ...prev].slice(0, 50)); // Keep last 50
        } catch (err) {
          console.error('🛡️ GLASS: Failed to parse signal', err);
        }
      };

      ws.onclose = () => {
        setStatus('disconnected');
        reconnectTimeout = setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      if (ws) ws.close();
      clearTimeout(reconnectTimeout);
    };
  }, [url]);

  return { signals, status };
}
