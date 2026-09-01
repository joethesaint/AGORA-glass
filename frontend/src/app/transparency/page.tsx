'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAgentSignals } from '@/hooks/useAgentSignals';
import { useAnalyticsStore } from '@/stores/analyticsStore';
import { GlassBoxTerminal } from '@/components/GlassBoxTerminal';
import { StrategyControlPanel } from '@/components/StrategyControlPanel';
import { ReasoningBlotter } from '@/components/ReasoningBlotter';

export default function Transparency() {
  const { signals, status } = useAgentSignals();
  const { rescueMetrics } = useAnalyticsStore();

  // Extract all reasoning traces
  const traces = useMemo(() => {
    return signals
      .filter(s => s.event_type === 'ReasoningTrace')
      .map(trace => {
        const data = { ...trace.data, timestamp: trace.timestamp };
        if (typeof data.reasoning_text === 'string') {
          try {
            data.reasoning_text = JSON.parse(data.reasoning_text);
          } catch (e) {
            // Keep as is if parsing fails
          }
        }
        return data;
      })
      .slice(-50); // High-density blotter allows 50
  }, [signals]);

  return (
    <main className="p-4 lg:p-8 max-w-[1400px] mx-auto space-y-8">
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Glass-Box Transparency Hub</h2>
          <div className={`px-3 py-1 rounded text-[10px] font-mono uppercase tracking-widest ${status === 'connected' ? 'bg-pos/10 text-pos border border-pos/20' : 'bg-neg/10 text-neg border border-neg/20'}`}>
            Sentinel Status: {status}
          </div>
        </div>
        <p className="text-sm text-muted max-w-2xl">
          Every risk decision made by the AGORA-glass sentinel is cryptographically hashed and pinned to the Arc network. 
          This hub provides human-readable access to those traces for real-time auditing and trustless verification.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8 flex flex-col space-y-6">
          <StrategyControlPanel />
          <div className="flex-1 min-h-[500px]">
             <ReasoningBlotter traces={traces} />
          </div>
        </div>

        <div className="xl:col-span-4 flex flex-col space-y-6">
          <h3 className="text-sm font-semibold text-[#787878] uppercase tracking-widest">Sentinel Terminal (Raw Data)</h3>
          <div className="flex-1">
            <GlassBoxTerminal signals={signals} rescueMetrics={rescueMetrics} />
          </div>
        </div>
      </div>
    </main>
  );
}
