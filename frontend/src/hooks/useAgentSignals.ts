'use client';

import { useEffect, useState, useCallback } from 'react';
import { AgentSignal, EventType } from '@/types/agent';
import { triggerAlert } from '@/components/AlertSystem';

export function useAgentSignals(url: string = 'ws://localhost:8765') {
  const [signals, setSignals] = useState<AgentSignal[]>([]);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');

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
          message: `Successfully moved ${payload.rescued_amount || 'funds'} to Circle Vault`,
          severity: 'low',
        });
      } else if (event_type === 'RiskVerdict' && payload.verdict === 'RESCUE') {
        triggerAlert({
          type: 'system',
          title: 'Emergency Verdict',
          message: `Risk engine determined rescue is necessary: ${payload.reason || 'Critical risk'}`,
          severity: 'critical',
        });
      }

      setSignals((prev) => [signal, ...prev].slice(0, 50));
    } catch (err) {
      console.error('🛡️ GLASS: Failed to parse signal', err);
    }
  }, []);

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
      if (ws) ws.close();
      clearTimeout(reconnectTimeout);
    };
  }, [url, processSignal]);

  return { signals, status };
}
