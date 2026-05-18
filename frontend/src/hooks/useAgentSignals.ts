'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { AgentSignal, EventType } from '@/types/agent';
import { triggerAlert } from '@/components/AlertSystem';

export function useAgentSignals(url: string = 'ws://localhost:8765') {
  const [signals, setSignals] = useState<AgentSignal[]>([]);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);

  const processSignal = useCallback((raw: any) => {
    try {
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
        data: payload,
        payload,
      };

      // Trigger Alerts based on signal type
      if (event_type === 'RescueInitiated') {
        triggerAlert({
          type: 'rescue',
          title: 'Rescue Initiated',
          message: `Sentinel is rescuing positions for ${payload.symbol || 'portfolio'}`,
          severity: 'high',
        });
      } else if (event_type === 'RescueComplete') {
        triggerAlert({
          type: 'success',
          title: 'Rescue Complete',
          message: `Successfully moved ${payload.amount || 'funds'} to Circle Vault`,
          severity: 'low',
        });
      } else if (event_type === 'RiskVerdict' && payload.status === 'CRITICAL') {
        triggerAlert({
          type: 'system',
          title: 'Emergency Verdict',
          message: `Risk engine determined rescue is necessary: ${payload.reason || 'Critical risk'}`,
          severity: 'critical',
        });
      } else if (event_type === 'MODE_CHANGED') {
          triggerAlert({
              type: 'system',
              title: 'Agent Mode Swapped',
              message: `Now operating in ${payload.mode.toUpperCase()} mode`,
              severity: 'low'
          });
      }

      setSignals((prev) => [signal, ...prev].slice(0, 50));
    } catch (err) {
      console.error('🛡️ GLASS: Failed to parse signal', err);
    }
  }, []);

  const sendSignal = useCallback((type: string, data: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, ...data }));
    } else {
      console.warn('🛡️ GLASS: Cannot send signal, WebSocket not connected');
    }
  }, []);

  useEffect(() => {
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      setStatus('connecting');
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus('connected');
        console.log('🛡️ GLASS: Connected to Sentinel Bridge');
      };

      ws.onmessage = (event) => {
        const raw = JSON.parse(event.data);
        processSignal(raw);
      };

      ws.onclose = () => {
        setStatus('disconnected');
        reconnectTimeout = setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      if (wsRef.current) wsRef.current.close();
      clearTimeout(reconnectTimeout);
    };
  }, [url, processSignal]);

  return { signals, status, sendSignal };
}
