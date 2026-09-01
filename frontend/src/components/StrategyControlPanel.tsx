'use client';

import { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { Settings, Zap, ShieldAlert, Sliders, ChevronRight, Target, Activity } from 'lucide-react';
import { useAgentSignals } from '@/hooks/useAgentSignals';

// Takes no props — memo means a parent re-render (e.g. page.tsx on any store
// tick) can't force this to re-render at all; only its own state/hooks can.
export const StrategyControlPanel = memo(function StrategyControlPanel() {
  const [maxLeverage, setMaxLeverage] = useState(5.0);
  const [safetyBand, setSafetyBand] = useState(0.12);
  const [loading, setLoading] = useState(false);
  const { sendSignal } = useAgentSignals();

  const handleUpdate = (param: string, value: number) => {
    setLoading(true);
    // Send dynamic config update to backend
    sendSignal('UPDATE_CONFIG', { [param]: value });
    
    setTimeout(() => {
        setLoading(false);
    }, 500);
  };

  return (
    <motion.div 
      className="agora-card p-6 space-y-8 relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
        <Settings size={120} />
      </div>

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-accent/10 rounded-lg text-accent">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">Active Controls</h3>
        </div>
        <div className={`flex items-center gap-2 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${loading ? 'bg-yellow-500/10 text-yellow-500 animate-pulse' : 'bg-green-500/10 text-green-500'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-yellow-500' : 'bg-green-500'}`} />
          {loading ? 'Syncing' : 'Connected'}
        </div>
      </div>

      <div className="space-y-8 relative z-10">
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted uppercase tracking-widest flex items-center gap-2">
                <Zap className="w-3 h-3 text-yellow-500" />
                Max Leverage Band
              </label>
              <p className="text-[10px] text-[#484848] font-medium leading-relaxed">
                Threshold for automated deleveraging.
              </p>
            </div>
            <span className="text-xl font-mono text-white font-black">{maxLeverage.toFixed(1)}<span className="text-xs text-muted">x</span></span>
          </div>
          <div className="relative pt-2">
            <input 
              type="range"
              min="1.0"
              max="10.0"
              step="0.1"
              value={maxLeverage}
              onChange={(e) => setMaxLeverage(parseFloat(e.target.value))}
              onMouseUp={() => handleUpdate('max_leverage', maxLeverage)}
              className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-accent hover:accent-[#00B2FF] transition-all"
            />
            <div className="flex justify-between mt-2 text-[8px] font-bold text-[#484848] uppercase tracking-widest">
                <span>Conservative</span>
                <span>Aggressive</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted uppercase tracking-widest flex items-center gap-2">
                <ShieldAlert className="w-3 h-3 text-neg" />
                Critical Safety Band
              </label>
              <p className="text-[10px] text-[#484848] font-medium leading-relaxed">
                Trigger point for rescue operations.
              </p>
            </div>
            <span className="text-xl font-mono text-white font-black">{(safetyBand * 100).toFixed(1)}<span className="text-xs text-muted">%</span></span>
          </div>
          <div className="relative pt-2">
            <input 
              type="range"
              min="0.05"
              max="0.25"
              step="0.01"
              value={safetyBand}
              onChange={(e) => setSafetyBand(parseFloat(e.target.value))}
              onMouseUp={() => handleUpdate('base_critical_threshold', safetyBand)}
              className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-neg hover:accent-[#FF5050] transition-all"
            />
            <div className="flex justify-between mt-2 text-[8px] font-bold text-[#484848] uppercase tracking-widest">
                <span>Tight</span>
                <span>Wide</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-white/5 space-y-4 relative z-10">
        <div className="flex items-center justify-between text-[10px] font-bold text-muted uppercase tracking-widest">
            <span>Agent Precision</span>
            <span className="text-white">High</span>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5 group hover:border-accent/20 transition-all cursor-default">
          <div className="p-2 rounded-lg bg-accent/10 text-accent group-hover:bg-accent group-hover:text-white transition-all">
            <Activity className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-white uppercase tracking-widest">Live Optimization</p>
            <p className="text-[9px] text-muted font-medium leading-relaxed">
              Propagating 48 parameters to Arc Network for validation.
            </p>
          </div>
          <ChevronRight className="w-4 h-4 ml-auto text-[#484848]" />
        </div>
      </div>
    </motion.div>
  );
});
