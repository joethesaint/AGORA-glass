import React from 'react';

export interface AgentSignal {
  event_type: string;
  payload: any;
  timestamp: number;
}

interface TerminalProps {
  signals: AgentSignal[];
}

export const GlassBoxTerminal: React.FC<TerminalProps> = ({ signals }) => {
  return (
    <div className="bg-[#000000] border border-[#1E2532] rounded-xl p-4 h-[400px] overflow-y-auto font-mono text-[13px]">
      <div className="flex items-center gap-2 mb-3 text-[#8A93A3] text-[11px] uppercase tracking-wider">
        <div className="w-2 h-2 bg-[#00D98F] rounded-full" />
        Live Sentinel Log
      </div>
      <div className="space-y-1">
        {signals.map((s, i) => (
          <p key={i}>
            <span className="text-[#8A93A3]">[{new Date(s.timestamp * 1000).toLocaleTimeString()}]</span>{' '}
            <span className="text-[#00A3FF]">{s.event_type}</span>{' '}
            <span className="text-[#F2F2F2]">{JSON.stringify(s.payload)}</span>
          </p>
        ))}
      </div>
    </div>
  );
};
