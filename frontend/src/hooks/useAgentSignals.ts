'use client';

import { useEffect, useState } from 'react';
import { GlassBoxTerminal, AgentSignal } from './GlassBoxTerminal';

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
          const signal: AgentSignal = JSON.parse(event.data);
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
      ws.close();
      clearTimeout(reconnectTimeout);
    };
  }, [url]);

  return { signals, status };
}
