'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Activity, AlertTriangle, TrendingUp } from 'lucide-react';

interface PortfolioOverviewCardProps {
  totalValue: number;
  avgMarginRatio: number;
  avgLeverage: number;
  positionCount: number;
  criticalPositions: number;
}

export const PortfolioOverviewCard = memo<PortfolioOverviewCardProps>(
  ({ totalValue, avgMarginRatio, avgLeverage, positionCount, criticalPositions }) => {
    const getHealthStatus = (critical: number, total: number) => {
      if (critical > 0) return 'critical';
      if (critical === 0 && total > 0) return 'healthy';
      return 'neutral';
    };

    const health = getHealthStatus(criticalPositions, positionCount);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="agora-card"
      >
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-bold text-white">Portfolio Overview</h3>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00D98F] animate-pulse" />
                <span className="text-[8px] font-bold text-[#00D98F] uppercase tracking-tighter">Live</span>
              </div>
            </div>
            <p className="text-[10px] text-[#8A93A3] font-bold uppercase tracking-widest">
              Monitoring: {positionCount} active {positionCount === 1 ? 'position' : 'positions'}
            </p>
          </div>
          <div
            className={`px-3 py-1 rounded-lg border text-[10px] font-mono tracking-widest bg-glow ${
              health === 'critical'
                ? 'bg-[#FF3B3B]/10 text-[#FF3B3B] border-[#FF3B3B]/20'
                : health === 'healthy'
                ? 'bg-[#00D98F]/10 text-[#00D98F] border-[#00D98F]/20'
                : 'bg-[#8A93A3]/10 text-[#8A93A3] border-[#8A93A3]/20'
            }`}
          >
            {health.toUpperCase()}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Total Value */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                <Wallet className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <span className="text-[10px] text-[#8A93A3] font-bold uppercase tracking-widest">Total Value</span>
            </div>
            <div>
              <motion.p
                key={totalValue}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                className="text-2xl font-bold text-white"
              >
                ${totalValue.toLocaleString()}
              </motion.p>
              <p className="text-[10px] text-[#484848] font-mono mt-1">Cross-exchange equity</p>
            </div>
          </div>

          {/* Avg Margin */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#00D98F]/10 border border-[#00D98F]/20">
                <Activity className="w-3.5 h-3.5 text-[#00D98F]" />
              </div>
              <span className="text-[10px] text-[#8A93A3] font-bold uppercase tracking-widest">Avg Margin</span>
            </div>
            <div>
              <motion.p
                key={avgMarginRatio}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                className="text-2xl font-bold text-[#00D98F]"
              >
                {(avgMarginRatio * 100).toFixed(1)}%
              </motion.p>
              <p className="text-[10px] text-[#484848] font-mono mt-1">Weighted average</p>
            </div>
          </div>

          {/* Avg Leverage */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#00A3FF]/10 border border-[#00A3FF]/20">
                <TrendingUp className="w-3.5 h-3.5 text-[#00A3FF]" />
              </div>
              <span className="text-[10px] text-[#8A93A3] font-bold uppercase tracking-widest">Avg Leverage</span>
            </div>
            <div>
              <motion.p
                key={avgLeverage}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                className="text-2xl font-bold text-[#00A3FF]"
              >
                {avgLeverage.toFixed(1)}x
              </motion.p>
              <p className="text-[10px] text-[#484848] font-mono mt-1">Portfolio factor</p>
            </div>
          </div>

          {/* Critical Alerts */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${criticalPositions > 0 ? 'bg-[#FF3B3B]/10 border-[#FF3B3B]/20' : 'bg-[#00D98F]/10 border-[#00D98F]/20'}`}>
                <AlertTriangle className={`w-3.5 h-3.5 ${criticalPositions > 0 ? 'text-[#FF3B3B]' : 'text-[#00D98F]'}`} />
              </div>
              <span className="text-[10px] text-[#8A93A3] font-bold uppercase tracking-widest">Risk Exposure</span>
            </div>
            <div>
              <motion.p
                key={criticalPositions}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                className={`text-2xl font-bold ${criticalPositions > 0 ? 'text-[#FF3B3B]' : 'text-[#00D98F]'}`}
              >
                {criticalPositions} CRITICAL
              </motion.p>
              <p className="text-[10px] text-[#484848] font-mono mt-1">Requiring intervention</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
);

PortfolioOverviewCard.displayName = 'PortfolioOverviewCard';
