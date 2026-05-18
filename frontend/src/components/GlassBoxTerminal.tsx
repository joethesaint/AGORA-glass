import React from 'react';

export const GlassBoxTerminal: React.FC<{ signals: any[] }> = ({ signals }) => {
  return (
    <div className="bg-black border border-[#1e1e1e] p-6 h-[500px] overflow-y-auto font-mono text-[12px] rounded-none">
      <div className="flex items-center gap-2 mb-4 text-[#484848] text-[10px] uppercase tracking-widest">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        Live Sentinel Log
      </div>
      
      {/* Analytics Summary Header */}
      <div className="mb-4 pb-4 border-b border-[#1e1e1e] text-[#d4ff3e]">
        <p>Total USDC Rescued: $3,500.00</p>
        <p>Avg Rescue Latency: 487ms</p>
        <p>Active Agents: 1</p>
      </div>

      <div className="space-y-1.5">
        {signals.map((s, i) => (
          <p key={i}>
            <span className="text-[#484848]">[{new Date(s.timestamp * 1000).toLocaleTimeString()}]</span>{' '}
            <span className="text-[#00A3FF]">{s.event_type}</span>{' '}
            <span className="text-[#f0f0f0]">{JSON.stringify(s.payload)}</span>
          </p>
        ))}
      </div>
    </div>
  );
};
