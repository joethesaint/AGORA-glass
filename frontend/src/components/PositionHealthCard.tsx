'use client';

import { useState, useEffect } from 'react';
import { useAnalyticsStore } from '@/stores/analyticsStore';
import { Shield, Activity, TrendingUp, AlertTriangle, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function PositionHealthCard() {
  const { livePositions } = useAnalyticsStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const positions = Object.values(livePositions);
  
  // Set default selection if none selected
  useEffect(() => {
    if (!selectedId && positions.length > 0) {
      setSelectedId(positions[0].id);
    }
  }, [positions, selectedId]);

  const activePosition = positions.find(p => p.id === selectedId) || positions[0];

  if (!activePosition) {
    return (
      <div className="agora-card flex items-center justify-center py-12 text-[#484848] italic text-sm">
        <Activity className="w-4 h-4 mr-2 animate-pulse" />
        Synchronizing position health...
      </div>
    );
  }

  const marginRatio = activePosition.marginRatio;
  const leverage = activePosition.leverage;
  
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
      className={`agora-card relative overflow-visible border ${isCritical ? 'border-[#FF3B3B]/30 shadow-[0_0_30px_rgba(255,59,59,0.1)]' : 'border-white/5'}`}
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isCritical ? 'bg-[#FF3B3B]/10' : 'bg-[#00D98F]/10'}`}>
            <Activity className={`w-4 h-4 ${isCritical ? 'text-[#FF3B3B]' : 'text-[#00D98F]'}`} />
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight uppercase">Live Position Health</h3>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-mono text-white transition-colors"
          >
            {activePosition.symbol}
            <ChevronDown className={`w-3 h-3 text-[#8A93A3] transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowDropdown(false)} 
                />
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute right-0 mt-2 w-32 bg-[#1A202C] border border-[#2D3748] rounded-xl shadow-2xl z-20 overflow-hidden"
                >
                  {positions.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedId(p.id);
                        setShowDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-[10px] font-mono transition-colors ${
                        selectedId === p.id 
                          ? 'bg-[#00A3FF]/10 text-[#00A3FF] font-bold' 
                          : 'text-[#8A93A3] hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {p.symbol}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
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

        {/* Supplementary Metrics Row */}
        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/5">
            <div className="text-left">
                <p className="text-[9px] font-bold text-[#8A93A3] uppercase tracking-widest mb-1">Unrealized PnL</p>
                <p className={`text-sm font-black font-mono ${activePosition.unrealizedPnL >= 0 ? 'text-[#00D98F]' : 'text-[#FF3B3B]'}`}>
                    ${activePosition.unrealizedPnL?.toFixed(2) || '0.00'}
                </p>
            </div>
            <div className="text-center border-x border-white/5">
                <p className="text-[9px] font-bold text-[#8A93A3] uppercase tracking-widest mb-1">Collateral</p>
                <p className="text-sm font-bold text-white font-mono">
                    ${activePosition.collateral?.toLocaleString() || '0'}
                </p>
            </div>
            <div className="text-right">
                <p className="text-[9px] font-bold text-[#8A93A3] uppercase tracking-widest mb-1">Position Size</p>
                <p className="text-sm font-bold text-white font-mono">
                    {activePosition.size?.toFixed(4) || '0'}
                </p>
            </div>
        </div>
      </div>
    </motion.div>
  );
}
