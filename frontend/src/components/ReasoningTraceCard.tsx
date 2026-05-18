'use client';

import { useState } from 'react';

export interface ReasoningTrace {
  agent_id: string;
  action: string;
  account: string;
  leverage_before: number;
  margin_ratio: number;
  rescue_amount_usdc: number;
  evidence: string[];
  risk_rating: string;
  reason_hash: string;
  reasoning_text: any; // Now expected to be an object after parsing
}

export function ReasoningTraceCard({ data }: { data: ReasoningTrace }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const jsonString = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass rounded-2xl p-6 shadow-xl border border-zinc-200/20 dark:border-zinc-800/50 bg-white/5 dark:bg-black/20">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Glass-Box Reasoning Trace</h3>
            <p className="text-xs text-zinc-500 font-mono mt-1">{data.agent_id} • {data.action}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${data.risk_rating === 'CRITICAL' ? 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30' : 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30'}`}>
            {data.risk_rating}
          </span>
          <button 
            onClick={handleCopy}
            className="text-xs px-3 py-1 rounded-lg bg-zinc-200/50 dark:bg-zinc-800 hover:bg-zinc-300/50 dark:hover:bg-zinc-700 transition-colors"
          >
            {copied ? 'Copied!' : 'Copy Trace'}
          </button>
        </div>
      </div>
      
      <div className="bg-zinc-950 p-5 rounded-xl border border-zinc-800 mb-6 overflow-x-auto shadow-inner">
        <pre className="text-xs font-mono text-emerald-400 whitespace-pre-wrap leading-relaxed">
          {JSON.stringify(data.reasoning_text, null, 2)}
        </pre>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-zinc-200/10 dark:border-zinc-800/50">
        <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Evidence</h4>
            <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1.5">
                {data.evidence.map((e, i) => (
                    <li key={i} className="flex gap-2 items-start">
                        <span className="text-emerald-500 mt-0.5">▹</span> {e}
                    </li>
                ))}
            </ul>
        </div>
        
        <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Audit Hash (Arc)</h4>
            <div className="p-3 bg-zinc-950 rounded-lg font-mono text-[10px] text-zinc-300 break-all border border-zinc-800 shadow-sm">
                {data.reason_hash}
            </div>
        </div>
      </div>
    </div>
  );
}
