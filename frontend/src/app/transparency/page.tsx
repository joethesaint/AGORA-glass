'use client';

import { useAgentSignals } from '@/hooks/useAgentSignals';
import { GlassBoxTerminal } from '@/components/GlassBoxTerminal';

export default function Transparency() {
  const { signals, status } = useAgentSignals();

  return (
    <main className="p-8 max-w-7xl mx-auto">
      <h2 className="text-xl font-semibold mb-6">Glass-Box Transparency Terminal</h2>
      
      <div className={`mb-4 px-3 py-1 rounded text-sm w-fit ${status === 'connected' ? 'bg-[#00D98F]/10 text-[#00D98F]' : 'bg-[#FF3B3B]/10 text-[#FF3B3B]'}`}>
        Status: {status.toUpperCase()}
      </div>

      <GlassBoxTerminal signals={signals} />
    </main>
  );
}
