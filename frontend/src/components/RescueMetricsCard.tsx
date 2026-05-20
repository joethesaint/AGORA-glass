'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Shield, Zap, Info } from 'lucide-react';

interface RescueMetricsCardProps {
  totalRescued: number;
  avgLatency: number;
  successRate: number;
  totalRescues: number;
}

export const RescueMetricsCard = memo<RescueMetricsCardProps>(
  ({ totalRescued, avgLatency, successRate, totalRescues }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="agora-card p-5 sm:p-6 lg:p-7 grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-6 lg:gap-x-8"
      >
        {/* Total Rescued */}
        <div className="space-y-3 relative group border-b border-white/5 sm:border-none pb-6 sm:pb-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#00D98F]/10 border border-[#00D98F]/20">
              <Shield className="w-3.5 h-3.5 text-[#00D98F]" />
            </div>
            <span className="text-[10px] text-[#8A93A3] font-bold uppercase tracking-widest">Total Rescued</span>
          </div>
          <div>
            <motion.p
              key={totalRescued}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              className="text-2xl font-bold text-[#00D98F] text-glow"
            >
              ${totalRescued.toLocaleString()}
            </motion.p>
            <p className="text-[10px] text-[#484848] font-mono mt-1">{totalRescues} automated rescues</p>
          </div>
        </div>

        {/* Avg Latency */}
        <div className="space-y-3 border-b border-white/5 sm:border-none pb-6 sm:pb-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#00A3FF]/10 border border-[#00A3FF]/20">
              <Zap className="w-3.5 h-3.5 text-[#00A3FF]" />
            </div>
            <span className="text-[10px] text-[#8A93A3] font-bold uppercase tracking-widest">Avg Latency</span>
          </div>
          <div>
            <motion.p
              key={avgLatency}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              className="text-2xl font-bold text-[#00A3FF]"
            >
              {avgLatency.toFixed(0)}ms
            </motion.p>
            <p className="text-[10px] text-[#484848] font-mono mt-1">Sub-500ms target</p>
          </div>
        </div>

        {/* Success Rate */}
        <div className="space-y-3 border-b border-white/5 sm:border-none pb-6 sm:pb-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <span className="text-[10px] text-[#8A93A3] font-bold uppercase tracking-widest">Efficiency</span>
          </div>
          <div>
            <motion.p
              key={successRate}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              className="text-2xl font-bold text-white"
            >
              {successRate.toFixed(1)}%
            </motion.p>
            <p className="text-[10px] text-[#484848] font-mono mt-1">Operational uptime</p>
          </div>
        </div>

        {/* Health */}
        <div className="space-y-3 pb-2 sm:pb-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#00D98F]/10 border border-[#00D98F]/20">
              <div className="w-3.5 h-3.5 flex items-center justify-center">
                <div className="w-2 h-2 bg-[#00D98F] rounded-full animate-pulse" />
              </div>
            </div>
            <span className="text-[10px] text-[#8A93A3] font-bold uppercase tracking-widest">Sentinel</span>
          </div>
          <div>
            <motion.p className="text-2xl font-bold text-[#00D98F]">ACTIVE</motion.p>
            <p className="text-[10px] text-[#484848] font-mono mt-1">Monitoring live risk</p>
          </div>
        </div>
      </motion.div>
    );
  }
);

RescueMetricsCard.displayName = 'RescueMetricsCard';
