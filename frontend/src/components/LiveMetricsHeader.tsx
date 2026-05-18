'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, DollarSign, Activity, ShieldCheck, Wifi, WifiOff } from 'lucide-react';

interface LiveMetricsHeaderProps {
  latencyMs: number;
  totalRescued: number;
  agentStatus: string;
  connectionStatus?: 'connecting' | 'connected' | 'disconnected';
}

export const LiveMetricsHeader = ({ latencyMs, totalRescued, agentStatus, connectionStatus = 'connected' }: LiveMetricsHeaderProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 lg:gap-6 mb-8">
      <MetricCard 
        label="E2E Engine Latency" 
        value={`${latencyMs.toFixed(0)}ms`} 
        icon={<Clock className="w-4 h-4 text-[#00A3FF]" />} 
        description="Sub-second reaction time"
      />
      <MetricCard 
        label="Total Rescued Equity" 
        value={`$${totalRescued.toLocaleString()}`} 
        icon={<DollarSign className="w-4 h-4 text-[#00D98F]" />} 
        description="USDC moved to safety"
      />
      <MetricCard 
        label="Sentinel Status" 
        value={agentStatus} 
        icon={<ShieldCheck className={`w-4 h-4 ${agentStatus === 'PROTECTING' ? 'text-[#00D98F]' : 'text-[#8A93A3]'}`} />} 
        status={agentStatus}
        description="Live on Arc Testnet"
      />
      <MetricCard 
        label="Bridge Connection" 
        value={connectionStatus.toUpperCase()} 
        icon={connectionStatus === 'connected' ? <Wifi className="w-4 h-4 text-[#00D98F]" /> : <WifiOff className="w-4 h-4 text-[#FF3B3B]" />} 
        status={connectionStatus === 'connected' ? 'connected' : 'disconnected'}
        description={connectionStatus === 'connected' ? 'Websocket Active' : 'Waiting for Bridge...'}
      />
    </div>
  );
};

const MetricCard = ({ label, value, icon, status, description }: { label: string, value: string, icon: React.ReactNode, status?: string, description: string }) => (
  <motion.div 
    whileHover={{ y: -2 }}
    className="agora-card flex items-center gap-4 lg:gap-6 group relative overflow-hidden"
  >
    <div className="p-3 bg-white/5 rounded-2xl border border-white/5 transition-colors group-hover:bg-white/10 group-hover:border-white/10">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] text-[#8A93A3] font-bold uppercase tracking-widest mb-0.5">{label}</p>
      <p className={`text-lg lg:text-xl font-bold font-mono tracking-tight ${status === 'PROTECTING' || status === 'connected' ? 'text-[#00D98F] text-glow' : status === 'disconnected' ? 'text-[#FF3B3B]' : 'text-white'}`}>
        {value}
      </p>
      <p className="text-[9px] text-[#484848] font-mono mt-1 uppercase tracking-tighter">{description}</p>
    </div>
    
    {/* Decorative background pulse for active status */}
    {(status === 'PROTECTING' || status === 'connected') && (
      <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#00D98F]/30" />
    )}
    {status === 'disconnected' && (
      <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#FF3B3B]/30" />
    )}
  </motion.div>
);
