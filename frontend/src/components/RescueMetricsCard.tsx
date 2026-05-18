'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Shield, Zap } from 'lucide-react';

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
        className="agora-card p-6 grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        {/* Total Rescued */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#00D98F]" />
            <span className="text-[10px] text-[#787878] uppercase tracking-widest">Total Rescued</span>
          </div>
          <motion.p
            key={totalRescued}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            className="text-2xl font-bold text-[#00D98F]"
          >
            ${totalRescued.toLocaleString()}
          </motion.p>
          <p className="text-[10px] text-[#787878]">{totalRescues} rescues</p>
        </div>

        {/* Avg Latency */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#00A3FF]" />
            <span className="text-[10px] text-[#787878] uppercase tracking-widest">Avg Latency</span>
          </div>
          <motion.p
            key={avgLatency}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            className="text-2xl font-bold text-[#00A3FF]"
          >
            {avgLatency}ms
          </motion.p>
          <p className="text-[10px] text-[#787878]">Sub-500ms target</p>
        </div>

        {/* Success Rate */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#d4ff3e]" />
            <span className="text-[10px] text-[#787878] uppercase tracking-widest">Success Rate</span>
          </div>
          <motion.p
            key={successRate}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            className="text-2xl font-bold text-[#d4ff3e]"
          >
            {successRate.toFixed(1)}%
          </motion.p>
          <p className="text-[10px] text-[#787878]">Operational reliability</p>
        </div>

        {/* Active Agents */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#00D98F] rounded-full animate-pulse" />
            <span className="text-[10px] text-[#787878] uppercase tracking-widest">Status</span>
          </div>
          <motion.p className="text-2xl font-bold text-[#00D98F]">LIVE</motion.p>
          <p className="text-[10px] text-[#787878]">Sentinel active</p>
        </div>
      </motion.div>
    );
  }
);

RescueMetricsCard.displayName = 'RescueMetricsCard';
