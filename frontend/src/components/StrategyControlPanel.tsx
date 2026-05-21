'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Zap, ShieldAlert, Sliders } from 'lucide-react';
import { useAgentSignals } from '@/hooks/useAgentSignals';

export const StrategyControlPanel = () => {
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
      className="agora-card p-6 space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[#00A3FF]/10 rounded-lg text-[#00A3FF]">
            <Sliders className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">Strategy Control</h3>
        </div>
        <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${loading ? 'bg-yellow-500/10 text-yellow-500 animate-pulse' : 'bg-green-500/10 text-green-500'}`}>
          {loading ? 'Syncing...' : 'Real-time'}
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold text-[#8A93A3] uppercase tracking-widest flex items-center gap-2">
              <Zap className="w-3 h-3 text-yellow-500" />
              Max Leverage Band
            </label>
            <span className="text-sm font-mono text-white font-bold">{maxLeverage.toFixed(1)}x</span>
          </div>
          <input 
            type="range"
            min="1.0"
            max="10.0"
            step="0.1"
            value={maxLeverage}
            onChange={(e) => setMaxLeverage(parseFloat(e.target.value))}
            onMouseUp={() => handleUpdate('max_leverage', maxLeverage)}
            className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-[#00A3FF]"
          />
          <p className="text-[10px] text-[#484848] leading-relaxed">
            The agent will automatically deleverage if positions exceed this threshold. Recommended: 3.0x - 5.0x.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold text-[#8A93A3] uppercase tracking-widest flex items-center gap-2">
              <ShieldAlert className="w-3 h-3 text-[#FF3B3B]" />
              Critical Safety Band
            </label>
            <span className="text-sm font-mono text-white font-bold">{(safetyBand * 100).toFixed(1)}%</span>
          </div>
          <input 
            type="range"
            min="0.05"
            max="0.25"
            step="0.01"
            value={safetyBand}
            onChange={(e) => setSafetyBand(parseFloat(e.target.value))}
            onMouseUp={() => handleUpdate('base_critical_threshold', safetyBand)}
            className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-[#FF3B3B]"
          />
          <p className="text-[10px] text-[#484848] leading-relaxed">
            Rescue logic triggers when the account margin ratio falls below this percentage.
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-white/5">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#00A3FF]/5 border border-[#00A3FF]/10">
          <div className="w-2 h-2 rounded-full bg-[#00A3FF] animate-pulse" />
          <p className="text-[9px] text-[#8A93A3] font-medium leading-relaxed">
            Changes are propagated instantly to the Python risk engine via WebSocket and stored in memory.
          </p>
        </div>
      </div>
    </motion.div>
  );
};
