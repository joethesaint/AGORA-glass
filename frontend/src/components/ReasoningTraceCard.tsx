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
  reasoning_text: string;
}

export function ReasoningTraceCard({ data }: { data: ReasoningTrace }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    // Pretty-print with 2-space indentation
    const jsonString = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass rounded-2xl p-6 shadow-lg border border-zinc-200/20 dark:border-zinc-800/50">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Glass-Box Reasoning Trace</h3>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${data.risk_rating === 'CRITICAL' ? 'bg-red-500/20 text-red-600 dark:text-red-400' : 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'}`}>
            {data.risk_rating}
          </span>
          <button 
            onClick={handleCopy}
            className="text-xs px-3 py-1 rounded-lg bg-zinc-200/50 dark:bg-zinc-800 hover:bg-zinc-300/50 dark:hover:bg-zinc-700 transition-colors"
          >
            {copied ? 'Copied!' : 'Copy JSON'}
          </button>
        </div>
      </div>
      
      <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-6 leading-relaxed bg-zinc-100/50 dark:bg-zinc-950/50 p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50">
        {data.reasoning_text}
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Evidence</h4>
            <ul className="text-xs text-zinc-600 dark:text-zinc-400 list-disc list-inside space-y-1">
                {data.evidence.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
        </div>
        
        <div className="space-y-2">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Audit Hash</h4>
            <div className="p-3 bg-zinc-950 dark:bg-black rounded-lg font-mono text-[10px] text-emerald-500 break-all border border-emerald-500/20">
                {data.reason_hash}
            </div>
        </div>
      </div>
    </div>
  );
}
