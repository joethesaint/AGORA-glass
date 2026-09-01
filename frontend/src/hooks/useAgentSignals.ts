'use client';

import { useEffect, useCallback } from 'react';
import { AgentSignal, EventType } from '@/types/agent';
import { AgentSignalSchema } from '@/types/schemas';
import { triggerAlert } from '@/components/AlertSystem';
import { useAnalyticsStore } from '@/stores/analyticsStore';

let globalWs: WebSocket | null = null;
let isConnecting = false;

export const sendWebSocketSignal = (type: string, data: any) => {
  if (globalWs && globalWs.readyState === WebSocket.OPEN) {
    globalWs.send(JSON.stringify({ type, ...data }));
  }
};

// Only use this in components that NEED to render the signals (e.g. EventFeed)
export function useAgentSignals() {
  const signals = useAnalyticsStore((state) => state.signals);
  const lastSignal = useAnalyticsStore((state) => state.lastSignal);
  const wsStatus = useAnalyticsStore((state) => state.wsStatus);
  return { 
    signals, 
    lastSignal, 
    status: wsStatus, 
    sendSignal: sendWebSocketSignal,
    lifetimeCount: signals.length,
    lifetimeStats: {} as Record<string, number>
  };
}

// Call this ONCE in App.tsx
export function useInitAgentSignals(url: string = 'ws://localhost:8765') {
  // Use non-reactive store getters/setters inside the callback to prevent React re-renders!
  const processSignal = useCallback((raw: any) => {
    try {
      const sanitized = { ...raw, timestamp: raw.timestamp || Date.now() / 1000 };
      const validation = AgentSignalSchema.safeParse(sanitized);
      if (!validation.success) return;
      
      const validatedRaw = validation.data;
      let type = validatedRaw.type as EventType;
      let payload = validatedRaw.data;
      let event_type = validatedRaw.type;

      if (validatedRaw.type === 'WSSignal' && validatedRaw.data) {
        type = validatedRaw.data.event_type as EventType;
        event_type = validatedRaw.data.event_type;
        payload = validatedRaw.data.payload;
      }

      const signal: AgentSignal = { type, event_type, timestamp: sanitized.timestamp, data: payload, payload };
      const store = useAnalyticsStore.getState(); // non-reactive read/write!

      if (event_type === 'ANALYTICS_UPDATE') {
        // avg_latency_ms comes straight from the backend's event-driven
        // GlassBoxAnalytics rolling-window average — already in ms. Display
        // it as reported; no artificial display ceiling.
        const latency = Math.max(0, Math.round(payload.avg_latency_ms ?? 0));
        store.updateRescueMetrics({
            totalRescued: payload.total_rescued_usdc,
            avgLatency: latency,
            totalRescues: payload.rescue_count,
            successRate: payload.success_rate,
        });
      }

      if (event_type === 'INITIAL_HISTORY') {
        const marginValues: { timestamp: number, ratio: number }[] = [];
        const leverageValues: { timestamp: number, leverage: number }[] = [];
        const firstSymbol = Object.keys(payload.margin)[0];
        
        if (firstSymbol) {
            payload.margin[firstSymbol].forEach(([ts, ratio]: [number, number]) => marginValues.push({ timestamp: ts * 1000, ratio }));
            payload.leverage[firstSymbol].forEach(([ts, leverage]: [number, number]) => leverageValues.push({ timestamp: ts * 1000, leverage }));
        }
        store.setHistory(marginValues, leverageValues);
        if (payload.positions) store.setInitialPositions(payload.positions);
      }

      if (event_type === 'PositionUpdate') {
        store.addMarginHistory(sanitized.timestamp * 1000, payload.margin_ratio);
        store.addLeverageHistory(sanitized.timestamp * 1000, payload.leverage);
        store.updateLivePosition(payload.symbol, payload);
      }

      if (event_type === 'ReasoningTrace') store.updateLatestReasoningTrace(payload);
      if (event_type === 'MarketVolatilityUpdate') store.updateMarketIntelligence(store.marketRegime, { symbol: payload.symbol, factor: payload.volatility_factor });
      if (event_type === 'MarketRegimeUpdate') store.updateMarketIntelligence(payload.regime, null);
      if (event_type === 'TradingSignal') store.updateLatestTrade(payload);

      // ALERTS
      if (event_type === 'RescueInitiated') triggerAlert({ type: 'rescue', title: 'Rescue Initiated', message: `Sentinel is rescuing positions for ${payload.symbol || 'portfolio'}`, severity: 'high' });
      else if (event_type === 'RescueComplete') triggerAlert({ type: 'success', title: 'Rescue Complete', message: `Successfully moved ${payload.amount || 'funds'} to Circle Vault`, severity: 'low' });
      else if (event_type === 'RiskVerdict' && payload.status === 'CRITICAL') triggerAlert({ type: 'system', title: 'Emergency Verdict', message: `Risk engine determined rescue is necessary: ${payload.reason || 'Critical risk'}`, severity: 'critical' });
      else if (event_type === 'MODE_CHANGED') triggerAlert({ type: 'system', title: 'Agent Mode Swapped', message: `Now operating in ${payload.mode?.toUpperCase()} mode`, severity: 'low' });
      else if (event_type === 'KILL_SWITCH_TRIPPED') triggerAlert({ type: 'system', title: 'KILL-SWITCH TRIPPED', message: `Emergency sequence initiated. All positions routing to ${payload.routing || 'A-book'}`, severity: 'critical' });

      store.addSignal(signal);
    } catch (err) {
      console.error('??? GLASS: Error processing signal:', err);
    }
  }, []);

  useEffect(() => {
    if (globalWs || isConnecting) return;
    
    isConnecting = true;
    let reconnectTimeout: NodeJS.Timeout;

    // Buffer to prevent React from re-rendering 50+ times a second
    let messageBuffer: any[] = [];
    let flushInterval: NodeJS.Timeout;

    const flushMessages = () => {
      if (messageBuffer.length === 0) return;
      
      // We process all buffered messages sequentially, but React 18+ will batch the 
      // Zustand state updates triggered inside them because it's inside a setTimeout
      const batch = [...messageBuffer];
      messageBuffer = [];
      
      batch.forEach(raw => processSignal(raw));
    };

    const connect = () => {
      useAnalyticsStore.getState().setWsStatus('connecting');
      const ws = new WebSocket(url);
      globalWs = ws;

      ws.onopen = () => {
        isConnecting = false;
        useAnalyticsStore.getState().setWsStatus('connected');
        flushInterval = setInterval(flushMessages, 100); // 10fps UI rendering!
      };

      ws.onmessage = (event) => {
        const raw = JSON.parse(event.data);
        messageBuffer.push(raw);
      };

      ws.onclose = () => {
        isConnecting = false;
        globalWs = null;
        useAnalyticsStore.getState().setWsStatus('disconnected');
        clearInterval(flushInterval);
        reconnectTimeout = setTimeout(connect, 3000);
      };
    };

    connect();
    return () => {
      // Do not clear reconnect on unmount for singleton
    };
  }, [url, processSignal]);
}
