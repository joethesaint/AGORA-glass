'use client';

import { useState, useMemo, memo } from 'react';
import { Shield, Copy, Check, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';

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

// Rendered from page.tsx's whole-store subscription, so this re-renders on
// every WS tick unless memoized — data is the only prop, so a shallow
// compare correctly skips re-render when an unrelated store field changed.
export const ReasoningTraceCard = memo(function ReasoningTraceCard({ data }: { data: ReasoningTrace }) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showJson, setShowJson] = useState(false);

  const isSentinel = data.agent_id === 'agora-glass-01';
  const borderColor = isSentinel ? 'border-pos' : 'border-[#A855F7]';
  const glowColor = isSentinel ? 'bg-pos/5' : 'bg-[#A855F7]/5';

  const handleCopy = () => {
    const jsonString = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Rebuilt only when the trace itself changes, not on every render.
  const pipelineSteps = useMemo(() => [
    {
      step: '01',
      label: 'Strategy',
      value: typeof data.reasoning_text === 'object' ? data.reasoning_text?.strategy : 'SENTINEL_GUARD',
      color: 'text-accent',
      dot: 'bg-accent',
    },
    {
      step: '02',
      label: 'Evidence Signals',
      value: `${data.evidence?.length ?? 0} signal${(data.evidence?.length ?? 0) !== 1 ? 's' : ''} flagged`,
      color: 'text-warn',
      dot: 'bg-warn',
    },
    {
      step: '03',
      label: 'Execution Action',
      value: typeof data.reasoning_text === 'object' ? data.reasoning_text?.action : data.action,
      color: 'text-white',
      dot: 'bg-white',
    },
    {
      step: '04',
      label: 'Arc Pin',
      value: data.reason_hash ? `${data.reason_hash.slice(0, 18)}…` : 'Pending',
      color: 'text-pos',
      dot: 'bg-pos',
    },
  ], [data]);

  return (
    <div className={`agora-card relative overflow-hidden border h-full flex flex-col ${borderColor}`}>
      {/* Background Accent */}
      <div className={`absolute top-0 right-0 w-64 h-64 ${glowColor} blur-3xl -z-10 rounded-full translate-x-1/2 -translate-y-1/2`} />
      
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6 mb-8">
        <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-1.5 rounded bg-pos/10 border border-pos/20">
                <Shield className="w-4 h-4 text-pos" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">GLASS Reasoning</h3>
            </div>
            <p className="text-[10px] text-muted font-mono uppercase tracking-[0.2em]">
              {data.agent_id.split('-').slice(2).join(' ').toUpperCase()} • {data.action}
            </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest ${data.risk_rating === 'CRITICAL' ? 'bg-neg/10 text-neg border border-neg/20' : 'bg-warn/10 text-warn border border-warn/20'}`}>
            {data.risk_rating}
          </span>
          <button 
            onClick={handleCopy}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all active:scale-95"
            title="Copy Trace JSON"
          >
            {copied ? <Check className="w-4 h-4 text-pos" /> : <Copy className="w-4 h-4 text-muted" />}
          </button>
        </div>
      </div>
      
      {/* Decision Pipeline */}
      <div className="bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-white/5 mb-8">
        <div className="text-[9px] text-[#484848] font-mono font-bold uppercase tracking-widest mb-5">Decision Pipeline</div>
        <div className="flex flex-col gap-0">
          {pipelineSteps.map((item, i, arr) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${item.dot}`} />
                {i < arr.length - 1 && <div className="w-px flex-1 bg-white/5 my-1" />}
              </div>
              <div className={`pb-5 ${i === arr.length - 1 ? '' : ''}`}>
                <div className="text-[9px] font-bold text-[#484848] uppercase tracking-widest mb-0.5">
                  {item.step} · {item.label}
                </div>
                <div className={`text-[11px] font-mono font-bold ${item.color}`}>{item.value ?? '—'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-white/5">
        <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-[10px] font-bold text-muted uppercase tracking-[0.2em]">Evidence Bundle</h4>
              {data.evidence.length > 2 && (
                <button onClick={() => setExpanded(!expanded)} className="text-[9px] font-bold text-accent hover:underline uppercase tracking-widest">
                  {expanded ? '[ - ] Collapse' : '[ + ] View All'}
                </button>
              )}
            </div>
            <ul className="space-y-3">
                {data.evidence.slice(0, expanded ? undefined : 2).map((e, i) => (
                    <li key={i} className="flex gap-3 items-start group">
                        <div className="w-1.5 h-1.5 rounded-full bg-pos/40 mt-1.5 group-hover:bg-pos transition-colors" />
                        <span className="text-[11px] text-white/80 leading-relaxed font-medium">{e}</span>
                    </li>
                ))}
            </ul>
        </div>
        
        <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-muted uppercase tracking-[0.2em]">On-Chain Verification</h4>
            <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5 group hover:border-pos/30 transition-colors">
                <div className="text-[9px] text-[#484848] font-bold uppercase mb-2">Arc Network Hash</div>
                <div className="font-mono text-[10px] text-pos break-all leading-relaxed">
                    {data.reason_hash}
                </div>
            </div>
            <div className="flex items-center justify-between">
                <a 
                href={`https://testnet.arcscan.io/hash/${data.reason_hash}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[10px] font-bold text-accent hover:text-accent/80 transition-colors uppercase tracking-widest"
                >
                Verify on Explorer <ExternalLink className="w-3 h-3" />
                </a>
                <button 
                    onClick={() => setShowJson(!showJson)}
                    className="flex items-center gap-1 text-[9px] font-bold text-[#484848] hover:text-muted transition-colors uppercase tracking-widest"
                >
                    {showJson ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    {showJson ? 'Hide JSON' : 'Show JSON'}
                </button>
            </div>
        </div>
      </div>

      {showJson && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-8 pt-8 border-t border-white/5"
          >
              <div className="rounded-xl bg-black/60 p-4 border border-white/5 overflow-x-auto">
                <pre className="text-[10px] font-mono text-muted">
                    {JSON.stringify(data, null, 2)}
                </pre>
              </div>
          </motion.div>
      )}
    </div>
  );
});
