import React from 'react';
import { Shield, ExternalLink, Activity } from 'lucide-react';
import { ReasoningTrace } from './ReasoningTraceCard';
import { motion, AnimatePresence } from 'framer-motion';

export const ReasoningBlotter = ({ traces }: { traces: (ReasoningTrace & { timestamp?: number })[] }) => {
  return (
    <div className="bg-[#0B0E14] border border-[#1E2532] rounded-xl overflow-hidden flex flex-col h-full shadow-2xl">
      <div className="flex justify-between items-center px-4 py-2 bg-[#131822] border-b border-[#1E2532]">
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-[#FF6B35]" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-white">Live Reasoning Stream</span>
        </div>
        <div className="text-[9px] text-[#484848] font-mono tracking-widest">ARC_TESTNET_CONNECTED</div>
      </div>
      
      <div className="overflow-auto flex-1 custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-[#0B0E14] z-10 border-b border-[#1E2532]">
            <tr>
              <th className="py-2 px-3 text-[9px] text-[#787878] font-mono uppercase font-normal w-[80px]">Time</th>
              <th className="py-2 px-3 text-[9px] text-[#787878] font-mono uppercase font-normal">Agent</th>
              <th className="py-2 px-3 text-[9px] text-[#787878] font-mono uppercase font-normal">Risk</th>
              <th className="py-2 px-3 text-[9px] text-[#787878] font-mono uppercase font-normal">Margin</th>
              <th className="py-2 px-3 text-[9px] text-[#787878] font-mono uppercase font-normal">Action</th>
              <th className="py-2 px-3 text-[9px] text-[#787878] font-mono uppercase font-normal">Arc Hash</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E2532]/50">
            {traces.length > 0 ? (
              traces.slice().reverse().map((trace) => {
                const timeStr = trace.timestamp 
                  ? new Date(trace.timestamp * 1000).toISOString().split('T')[1].slice(0, 12)
                  : new Date().toISOString().split('T')[1].slice(0, 12);
                
                const isCritical = trace.risk_rating === 'CRITICAL' || trace.risk_rating === 'HIGH';
                
                return (
                  <tr 
                    key={trace.reason_hash}
                    className="hover:bg-[#131822] transition-colors group cursor-default animate-in fade-in slide-in-from-top-1 duration-300"
                  >
                    <td className="py-1.5 px-3 text-[10px] text-[#787878] font-mono align-top">{timeStr}</td>
                    <td className="py-1.5 px-3 text-[10px] text-[#A855F7] font-mono align-top">
                      {trace.agent_id.replace('agora-glass-01-', '') || 'sentinel'}
                    </td>
                    <td className="py-1.5 px-3 align-top">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold font-mono tracking-widest ${isCritical ? 'bg-neg/10 text-neg' : 'bg-pos/10 text-pos'}`}>
                        {trace.risk_rating}
                      </span>
                    </td>
                    <td className="py-1.5 px-3 text-[10px] text-white font-mono align-top">
                      {(trace.margin_ratio * 100).toFixed(1)}%
                    </td>
                    <td className="py-1.5 px-3 text-[10px] text-white font-mono align-top">
                      {trace.action.replace(/_/g, ' ')}
                    </td>
                    <td className="py-1.5 px-3 align-top">
                      <a 
                        href={`https://testnet.arcscan.io/hash/${trace.reason_hash}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] text-accent hover:text-white font-mono transition-colors"
                      >
                        {trace.reason_hash.slice(0, 12)}...
                        <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[10px] text-[#484848] font-mono italic">
                  No reasoning traces recorded yet. Listening for Arc Network pins...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
