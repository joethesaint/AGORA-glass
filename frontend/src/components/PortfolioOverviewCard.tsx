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
        className="agora-card p-6"
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-md font-medium tracking-wide text-white mb-2">Portfolio Overview</h3>
            <p className="text-[10px] text-[#787878] uppercase tracking-widest">
              {positionCount} active {positionCount === 1 ? 'position' : 'positions'}
            </p>
          </div>
          <div
            className={`px-3 py-1 rounded border text-[10px] font-mono tracking-widest ${
              health === 'critical'
                ? 'bg-[#FF3B3B]/10 text-[#FF3B3B] border-[#FF3B3B]/20'
                : health === 'healthy'
                ? 'bg-[#00D98F]/10 text-[#00D98F] border-[#00D98F]/20'
                : 'bg-[#787878]/10 text-[#787878] border-[#787878]/20'
            }`}
          >
            {health.toUpperCase()}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Total Value */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-[#00A3FF]" />
              <span className="text-[10px] text-[#787878] uppercase tracking-widest">Total Value</span>
            </div>
            <motion.p
              key={totalValue}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              className="text-lg font-bold text-[#00A3FF]"
            >
              ${(totalValue / 1000).toFixed(0)}K
            </motion.p>
          </div>

          {/* Avg Margin */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#d4ff3e]" />
              <span className="text-[10px] text-[#787878] uppercase tracking-widest">Avg Margin</span>
            </div>
            <motion.p
              key={avgMarginRatio}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              className="text-lg font-bold text-[#d4ff3e]"
            >
              {(avgMarginRatio * 100).toFixed(1)}%
            </motion.p>
          </div>

          {/* Avg Leverage */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#00D98F]" />
              <span className="text-[10px] text-[#787878] uppercase tracking-widest">Avg Leverage</span>
            </div>
            <motion.p
              key={avgLeverage}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              className="text-lg font-bold text-[#00D98F]"
            >
              {avgLeverage.toFixed(1)}x
            </motion.p>
          </div>

          {/* Active Positions */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#00A3FF]" />
              <span className="text-[10px] text-[#787878] uppercase tracking-widest">Active</span>
            </div>
            <motion.p
              key={positionCount}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              className="text-lg font-bold text-[#00A3FF]"
            >
              {positionCount}
            </motion.p>
          </div>

          {/* Critical Positions */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#FF3B3B]" />
              <span className="text-[10px] text-[#787878] uppercase tracking-widest">Critical</span>
            </div>
            <motion.p
              key={criticalPositions}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              className={`text-lg font-bold ${criticalPositions > 0 ? 'text-[#FF3B3B]' : 'text-[#00D98F]'}`}
            >
              {criticalPositions}
            </motion.p>
          </div>
        </div>
      </motion.div>
    );
  }
);

PortfolioOverviewCard.displayName = 'PortfolioOverviewCard';
