'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Clock, DollarSign, Activity, ShieldCheck, Wifi, WifiOff } from 'lucide-react';

interface LiveMetricsHeaderProps {
  latencyMs: number;
  totalRescued: number;
  agentStatus: string;
  agentName?: string;
  connectionStatus?: 'connecting' | 'connected' | 'disconnected';
}

// Rendered from page.tsx's whole-store subscription, so this re-renders on
// every WS tick unless props are unchanged — memo lets it skip re-rendering
// (and re-evaluating its motion.div hover targets) when an unrelated store
// field updated but latencyMs/totalRescued/agentStatus/connectionStatus didn't.
export const LiveMetricsHeader = memo(function LiveMetricsHeader({ latencyMs, totalRescued, agentStatus, agentName = 'SENTINEL', connectionStatus = 'connected' }: LiveMetricsHeaderProps) {
  // Real number, not clamped — a value at or above the sub-500ms target is
  // the thing this KPI exists to surface. 'medium' gives a warn tier before
  // the hard 'slow'/red state, matching how the rest of the dashboard grades
  // latency (see AVG99/VaR-style thresholds elsewhere).
  const latencyStatus = latencyMs <= 500 ? 'fast' : latencyMs <= 800 ? 'medium' : 'slow';
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
      <MetricCard
        label="E2E Engine Latency"
        value={`${latencyMs.toFixed(0)}ms`}
        icon={<Clock className="w-4 h-4 text-accent" />}
        description="Sub-500ms target"
        status={latencyStatus}
      />
      <MetricCard 
        label="Total Rescued Equity" 
        value={`$${totalRescued.toLocaleString()}`} 
        icon={<DollarSign className="w-4 h-4 text-pos" />} 
        description="USDC moved to safety"
      />
      <MetricCard 
        label={`${agentName} Status`} 
        value={agentStatus} 
        icon={<ShieldCheck className={`w-4 h-4 ${agentStatus.toUpperCase() === 'PROTECTING' || agentStatus.toUpperCase() === 'TRADING' ? 'text-pos' : 'text-muted'}`} />} 
        status={agentStatus.toUpperCase()}
        description="Live on Arc Testnet"
      />
      <MetricCard 
        label="Bridge Connection" 
        value={connectionStatus.toUpperCase()} 
        icon={connectionStatus === 'connected' ? <Wifi className="w-4 h-4 text-pos" /> : <WifiOff className="w-4 h-4 text-neg" />} 
        status={connectionStatus === 'connected' ? 'connected' : 'disconnected'}
        description={connectionStatus === 'connected' ? 'Websocket Active' : 'Waiting for Bridge...'}
      />
    </div>
  );
});

const MetricCard = ({ label, value, icon, status, description }: { label: string, value: string, icon: React.ReactNode, status?: string, description: string }) => (
  <motion.div 
    whileHover={{ y: -2 }}
    className="agora-card flex items-center gap-4 lg:gap-6 group relative overflow-hidden"
  >
    <div className="p-3 bg-white/5 rounded-2xl border border-white/5 transition-colors group-hover:bg-white/10 group-hover:border-white/10">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] text-muted font-bold uppercase tracking-widest mb-0.5">{label}</p>
      <p className={`text-lg lg:text-xl font-bold font-mono tracking-tight ${status === 'PROTECTING' || status === 'connected' || status === 'fast' ? 'text-pos text-glow' : status === 'disconnected' || status === 'slow' ? 'text-neg' : status === 'medium' ? 'text-warn' : 'text-white'}`}>
        {value}
      </p>
      <p className="text-[9px] text-[#484848] font-mono mt-1 uppercase tracking-tighter">{description}</p>
    </div>
    
    {/* Decorative background pulse for active status */}
    {(status === 'PROTECTING' || status === 'connected') && (
      <div className="absolute right-0 top-0 bottom-0 w-1 bg-pos/30" />
    )}
    {status === 'disconnected' && (
      <div className="absolute right-0 top-0 bottom-0 w-1 bg-neg/30" />
    )}
  </motion.div>
);
