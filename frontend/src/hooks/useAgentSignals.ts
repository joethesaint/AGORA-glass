'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { AgentSignal, EventType } from '@/types/agent';
import { AgentSignalSchema } from '@/types/schemas';
import { triggerAlert } from '@/components/AlertSystem';
import { useAnalyticsStore } from '@/stores/analyticsStore';

export function useAgentSignals(url: string = 'ws://localhost:8765') {
  const [signals, setSignals] = useState<AgentSignal[]>([]);
  const [lastSignal, setLastSignal] = useState<AgentSignal | null>(null);
  const [lifetimeCount, setLifetimeCount] = useState<number>(0);
  const [lifetimeStats, setLifetimeStats] = useState<Record<string, number>>({});
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);

  const { 
    updateRescueMetrics, 
    addMarginHistory, 
    addLeverageHistory, 
    updateLivePosition,
    updateMarketIntelligence,
    updateLatestReasoningTrace,
    updateLatestTrade,
    setHistory,
    setInitialPositions,
    marketRegime
  } = useAnalyticsStore();

  const processSignal = useCallback((raw: any) => {
    try {
      // Fix for null timestamp coming from backend
      const sanitized = {
        ...raw,
        timestamp: raw.timestamp || Date.now() / 1000,
      };

      const validation = AgentSignalSchema.safeParse(sanitized);

      if (!validation.success) {
        console.warn('🛡️ GLASS: Invalid signal format (after fix):', validation.error.format());
        return;
      }
      
      const validatedRaw = validation.data;
      let type = validatedRaw.type as EventType;
      let payload = validatedRaw.data;
      let event_type = validatedRaw.type;

      // Special handling for WSSignal wrapper to flatten it
      if (validatedRaw.type === 'WSSignal' && validatedRaw.data) {
        type = validatedRaw.data.event_type as EventType;
        event_type = validatedRaw.data.event_type;
        payload = validatedRaw.data.payload;
      }

      const signal: AgentSignal = {
        type,
        event_type,
        timestamp: sanitized.timestamp,
        data: payload,
        payload,
      };

      // --- INTEGRATION WITH ANALYTICS STORE ---
      
      if (event_type === 'ANALYTICS_UPDATE') {
        updateRescueMetrics({
            totalRescued: payload.total_rescued_usdc,
            avgLatency: payload.avg_latency_ms,
            totalRescues: payload.rescue_count,
            successRate: payload.success_rate,
        });
      }

      if (event_type === 'INITIAL_HISTORY') {
        // Flatten the backend history into the format expected by the store
        // We take the average or the first symbol's history for the main chart
        const marginValues: { timestamp: number, ratio: number }[] = [];
        const leverageValues: { timestamp: number, leverage: number }[] = [];
        
        // Use the first symbol found in history for now
        const firstSymbol = Object.keys(payload.margin)[0];
        if (firstSymbol) {
            payload.margin[firstSymbol].forEach(([ts, ratio]: [number, number]) => {
                marginValues.push({ timestamp: ts * 1000, ratio });
            });
            payload.leverage[firstSymbol].forEach(([ts, leverage]: [number, number]) => {
                leverageValues.push({ timestamp: ts * 1000, leverage });
            });
        }
        
        setHistory(marginValues, leverageValues);

        if (payload.positions) {
            setInitialPositions(payload.positions);
        }

        if (payload.events) {
            const initialSignals = payload.events.map((e: any) => ({
                type: e.type as EventType,
                event_type: e.type,
                timestamp: e.timestamp || Date.now() / 1000,
                data: e.data,
                payload: e.data
            }));
            setSignals(initialSignals.reverse());
        }
      }

      if (event_type === 'PositionUpdate') {
        addMarginHistory(sanitized.timestamp * 1000, payload.margin_ratio);
        addLeverageHistory(sanitized.timestamp * 1000, payload.leverage);
        updateLivePosition(payload.symbol, payload);
      }

      if (event_type === 'ReasoningTrace') {
        updateLatestReasoningTrace(payload);
      }

      if (event_type === 'MarketVolatilityUpdate') {
        updateMarketIntelligence(marketRegime, { symbol: payload.symbol, factor: payload.volatility_factor });
      }

      if (event_type === 'MarketRegimeUpdate') {
        updateMarketIntelligence(payload.regime, null);
      }

      if (event_type === 'TradingSignal') {
        updateLatestTrade(payload);
      }

      // --- ALERTS ---

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
      setLastSignal(signal);
      setLifetimeCount((prev) => prev + 1);
      setLifetimeStats((prev) => ({
        ...prev,
        [event_type]: (prev[event_type] || 0) + 1,
      }));
    } catch (err) {
      console.error('🛡️ GLASS: Error processing signal:', err);
    }
  }, [updateRescueMetrics, addMarginHistory, addLeverageHistory, updateLivePosition, updateMarketIntelligence, updateLatestReasoningTrace, updateLatestTrade, setHistory, setInitialPositions, marketRegime]);

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

  return { signals, lastSignal, lifetimeCount, lifetimeStats, status, sendSignal };
}
