'use client';

import { useAnalyticsStore } from '@/stores/analyticsStore';
import { Shield, Activity, TrendingUp, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export function PositionHealthCard() {
  const { livePositions } = useAnalyticsStore();
  
  // For the shakedown, we track the most "active" or first position
  const positions = Object.values(livePositions);
  const primaryPosition = positions[0];

  if (!primaryPosition) {
    return (
      <div className="agora-card flex items-center justify-center py-12 text-[#484848] italic text-sm">
        <Activity className="w-4 h-4 mr-2 animate-pulse" />
        Synchronizing position health...
      </div>
    );
  }

  const marginRatio = primaryPosition.marginRatio;
  const leverage = primaryPosition.leverage;
  
  const CRITICAL_THRESHOLD = 0.12;
  const WARNING_THRESHOLD = 0.20;

  const isCritical = marginRatio < CRITICAL_THRESHOLD;
  const isWarning = marginRatio < WARNING_THRESHOLD && !isCritical;

  const getMarginColor = () => {
    if (isCritical) return 'text-[#FF3B3B]';
    if (isWarning) return 'text-[#F5A623]';
    return 'text-[#00D98F]';
  };

  const getMarginBg = () => {
    if (isCritical) return 'bg-[#FF3B3B]';
    if (isWarning) return 'bg-[#F5A623]';
    return 'bg-[#00D98F]';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`agora-card relative overflow-hidden border ${isCritical ? 'border-[#FF3B3B]/30 shadow-[0_0_30px_rgba(255,59,59,0.1)]' : 'border-white/5'}`}
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isCritical ? 'bg-[#FF3B3B]/10' : 'bg-[#00D98F]/10'}`}>
            <Activity className={`w-4 h-4 ${isCritical ? 'text-[#FF3B3B]' : 'text-[#00D98F]'}`} />
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight uppercase">Live Position Health</h3>
        </div>
        <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-[#8A93A3] uppercase tracking-widest">
            {primaryPosition.symbol}
        </div>
      </div>

      <div className="space-y-8">
        {/* Margin Ratio Section */}
        <div className="space-y-3">
          <div className="flex items-end justify-between">
            <div>
                <p className="text-[10px] font-bold text-[#8A93A3] uppercase tracking-[0.2em] mb-1">Margin Ratio</p>
                <div className={`text-3xl font-black font-mono ${getMarginColor()}`}>
                    {(marginRatio * 100).toFixed(2)}%
                </div>
            </div>
            <div className="text-right">
                <p className="text-[10px] font-bold text-[#484848] uppercase tracking-widest mb-1">Safety Band</p>
                <p className="text-xs font-bold text-white uppercase tracking-widest">{(CRITICAL_THRESHOLD * 100).toFixed(0)}% Min</p>
            </div>
          </div>
          
          <div className="relative h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(marginRatio * 100, 100)}%` }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className={`h-full ${getMarginBg()} shadow-[0_0_15px_rgba(0,0,0,0.5)]`}
            />
            {/* Threshold Markers */}
            <div className="absolute top-0 bottom-0 w-0.5 bg-[#FF3B3B] opacity-50 z-10" style={{ left: `${CRITICAL_THRESHOLD * 100}%` }} />
            <div className="absolute top-0 bottom-0 w-0.5 bg-[#F5A623] opacity-30 z-10" style={{ left: `${WARNING_THRESHOLD * 100}%` }} />
          </div>
          
          <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-[#484848]">
            <span>0%</span>
            <span>Critical</span>
            <span>Target 25%</span>
          </div>
        </div>

        {/* Leverage Section */}
        <div className="space-y-3 pt-4 border-t border-white/5">
          <div className="flex items-end justify-between">
            <div>
                <p className="text-[10px] font-bold text-[#8A93A3] uppercase tracking-[0.2em] mb-1">Portfolio Leverage</p>
                <div className={`text-3xl font-black font-mono ${leverage > 5 ? 'text-[#FF3B3B]' : 'text-white'}`}>
                    {leverage.toFixed(2)}x
                </div>
            </div>
            <div className="text-right">
                <p className="text-[10px] font-bold text-[#484848] uppercase tracking-widest mb-1">Soft Limit</p>
                <p className="text-xs font-bold text-white uppercase tracking-widest">5.0x Max</p>
            </div>
          </div>
          
          <div className="relative h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((leverage / 10) * 100, 100)}%` }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className={`h-full ${leverage > 5 ? 'bg-[#FF3B3B]' : 'bg-[#00A3FF]'} shadow-[0_0_15px_rgba(0,0,0,0.5)]`}
            />
            <div className="absolute top-0 bottom-0 w-0.5 bg-[#FF3B3B] opacity-50 z-10" style={{ left: '50%' }} />
          </div>

          <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-[#484848]">
            <span>1x</span>
            <span>Safe Band</span>
            <span>10x Max</span>
          </div>
        </div>

        {/* Dynamic Risk Rating Badge */}
        <div className="flex justify-center pt-2">
            <div className={`flex items-center gap-2 px-6 py-2 rounded-xl border font-black text-xs tracking-tighter transition-all ${
                isCritical 
                ? 'bg-[#FF3B3B]/10 border-[#FF3B3B]/20 text-[#FF3B3B] shadow-[0_0_20px_rgba(255,59,59,0.1)]' 
                : isWarning 
                ? 'bg-[#F5A623]/10 border-[#F5A623]/20 text-[#F5A623]' 
                : 'bg-[#00D98F]/10 border-[#00D98F]/20 text-[#00D98F]'
            }`}>
                {isCritical && <AlertTriangle className="w-4 h-4" />}
                {isCritical ? 'CRITICAL RISK DETECTED' : isWarning ? 'CAUTION: VOLATILE' : 'NOMINAL STABILITY'}
            </div>
        </div>
      </div>
    </motion.div>
  );
}
