'use client';

import { useMemo } from 'react';
import { useAgentSignals } from '@/hooks/useAgentSignals';
import { GlassBoxTerminal } from '@/components/GlassBoxTerminal';
import { ReasoningTraceCard } from '@/components/ReasoningTraceCard';

export default function Transparency() {
  const { signals, status } = useAgentSignals();

  // Extract all reasoning traces
  const traces = useMemo(() => {
    return signals
      .filter(s => s.event_type === 'ReasoningTrace')
      .map(trace => {
        const data = { ...trace.data };
        if (typeof data.reasoning_text === 'string') {
          try {
            data.reasoning_text = JSON.parse(data.reasoning_text);
          } catch (e) {
            // Keep as is if parsing fails
          }
        }
        return data;
      });
  }, [signals]);

  return (
    <main className="p-8 max-w-7xl mx-auto space-y-12">
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Glass-Box Transparency Hub</h2>
          <div className={`px-3 py-1 rounded text-[10px] font-mono uppercase tracking-widest ${status === 'connected' ? 'bg-[#00D98F]/10 text-[#00D98F] border border-[#00D98F]/20' : 'bg-[#FF3B3B]/10 text-[#FF3B3B] border border-[#FF3B3B]/20'}`}>
            Sentinel Status: {status}
          </div>
        </div>
        <p className="text-sm text-[#8A93A3] max-w-2xl">
          Every risk decision made by the AGORA-glass sentinel is cryptographically hashed and pinned to the Arc network. 
          This hub provides human-readable access to those traces for real-time auditing and trustless verification.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <h3 className="text-sm font-semibold text-[#787878] uppercase tracking-widest">Live Reasoning Stream</h3>
          {traces.length > 0 ? (
            traces.map((trace, i) => (
              <ReasoningTraceCard key={trace.reason_hash || i} data={trace} />
            ))
          ) : (
            <div className="h-64 flex items-center justify-center border border-dashed border-[#1e1e1e] rounded-2xl text-[#484848] text-sm italic">
              No reasoning traces recorded in this session.
            </div>
          )}
        </div>

        <div className="space-y-8">
          <h3 className="text-sm font-semibold text-[#787878] uppercase tracking-widest">Sentinel Terminal (Raw Data)</h3>
          <GlassBoxTerminal signals={signals} />
        </div>
      </div>
    </main>
  );
}
