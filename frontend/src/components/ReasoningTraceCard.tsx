'use client';

import { useState } from 'react';
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

export function ReasoningTraceCard({ data }: { data: ReasoningTrace }) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showJson, setShowJson] = useState(false);

  const isSentinel = data.agent_id === 'agora-glass-01';
  const borderColor = isSentinel ? 'border-[#00D98F]' : 'border-[#A855F7]';
  const glowColor = isSentinel ? 'bg-[#00D98F]/5' : 'bg-[#A855F7]/5';

  const handleCopy = () => {
    const jsonString = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`agora-card relative overflow-hidden border ${borderColor}`}>
      {/* Background Accent */}
      <div className={`absolute top-0 right-0 w-64 h-64 ${glowColor} blur-3xl -z-10 rounded-full translate-x-1/2 -translate-y-1/2`} />
      
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6 mb-8">
        <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-1.5 rounded bg-[#00D98F]/10 border border-[#00D98F]/20">
                <Shield className="w-4 h-4 text-[#00D98F]" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">GLASS Reasoning</h3>
            </div>
            <p className="text-[10px] text-[#8A93A3] font-mono uppercase tracking-[0.2em]">
              {data.agent_id.split('-').slice(2).join(' ').toUpperCase()} • {data.action}
            </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest ${data.risk_rating === 'CRITICAL' ? 'bg-[#FF3B3B]/10 text-[#FF3B3B] border border-[#FF3B3B]/20' : 'bg-[#F5A623]/10 text-[#F5A623] border border-[#F5A623]/20'}`}>
            {data.risk_rating}
          </span>
          <button 
            onClick={handleCopy}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all active:scale-95"
            title="Copy Trace JSON"
          >
            {copied ? <Check className="w-4 h-4 text-[#00D98F]" /> : <Copy className="w-4 h-4 text-[#8A93A3]" />}
          </button>
        </div>
      </div>
      
      <div className="bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-white/5 mb-8 group relative">
        <div className="absolute top-4 right-6 text-[9px] text-[#484848] font-mono font-bold uppercase group-hover:text-[#8A93A3] transition-colors">
          Deterministic Reasoning Log
        </div>
        <div className="text-[11px] font-mono text-[#00D98F]/90 whitespace-pre-wrap leading-relaxed custom-scrollbar max-h-[300px] overflow-y-auto pr-4">
          {typeof data.reasoning_text === 'string' ? (
              <p>{data.reasoning_text}</p>
          ) : (
              <div className="space-y-4">
                  {data.reasoning_text?.strategy && (
                      <div>
                          <span className="text-[#8A93A3] uppercase text-[9px] block mb-1">Active Strategy</span>
                          <span className="text-white font-bold">{data.reasoning_text.strategy}</span>
                      </div>
                  )}
                  {data.reasoning_text?.reason && (
                      <div>
                          <span className="text-[#8A93A3] uppercase text-[9px] block mb-1">Core Rationale</span>
                          <span className="leading-relaxed">{data.reasoning_text.reason}</span>
                      </div>
                  )}
                  {data.reasoning_text?.action && (
                      <div>
                          <span className="text-[#8A93A3] uppercase text-[9px] block mb-1">Planned Execution</span>
                          <span className="text-[#00A3FF] font-bold underline decoration-dotted">{data.reasoning_text.action}</span>
                      </div>
                  )}
              </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-white/5">
        <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-[10px] font-bold text-[#8A93A3] uppercase tracking-[0.2em]">Evidence Bundle</h4>
              {data.evidence.length > 2 && (
                <button onClick={() => setExpanded(!expanded)} className="text-[9px] font-bold text-[#00A3FF] hover:underline uppercase tracking-widest">
                  {expanded ? '[ - ] Collapse' : '[ + ] View All'}
                </button>
              )}
            </div>
            <ul className="space-y-3">
                {data.evidence.slice(0, expanded ? undefined : 2).map((e, i) => (
                    <li key={i} className="flex gap-3 items-start group">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#00D98F]/40 mt-1.5 group-hover:bg-[#00D98F] transition-colors" />
                        <span className="text-[11px] text-white/80 leading-relaxed font-medium">{e}</span>
                    </li>
                ))}
            </ul>
        </div>
        
        <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-[#8A93A3] uppercase tracking-[0.2em]">On-Chain Verification</h4>
            <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5 group hover:border-[#00D98F]/30 transition-colors">
                <div className="text-[9px] text-[#484848] font-bold uppercase mb-2">Arc Network Hash</div>
                <div className="font-mono text-[10px] text-[#00D98F] break-all leading-relaxed">
                    {data.reason_hash}
                </div>
            </div>
            <div className="flex items-center justify-between">
                <a 
                href={`https://testnet.arcscan.io/hash/${data.reason_hash}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[10px] font-bold text-[#00A3FF] hover:text-[#00A3FF]/80 transition-colors uppercase tracking-widest"
                >
                Verify on Explorer <ExternalLink className="w-3 h-3" />
                </a>
                <button 
                    onClick={() => setShowJson(!showJson)}
                    className="flex items-center gap-1 text-[9px] font-bold text-[#484848] hover:text-[#8A93A3] transition-colors uppercase tracking-widest"
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
                <pre className="text-[10px] font-mono text-[#8A93A3]">
                    {JSON.stringify(data, null, 2)}
                </pre>
              </div>
          </motion.div>
      )}
    </div>
  );
}
