import React from 'react';
import { motion } from 'framer-motion';
import { StatusBadge } from './StatusBadge';

interface PositionData {
  entryPrice: number;
  currentPrice: number;
  marginRatio: number;
  leverage: number;
}

export const ActivePositionsWidget: React.FC<{ data: PositionData }> = ({ data }) => {
  const getStatusType = (leverage: number): 'safe' | 'warning' | 'critical' => {
    if (leverage > 5) return 'critical';
    if (leverage > 3) return 'warning';
    return 'safe';
  };

  const status = getStatusType(data.leverage);
  const statusText = status === 'critical' ? "CRITICAL – Rescue needed" : status === 'warning' ? "Moderate" : "Safe";
  const gaugeWidth = Math.min((data.leverage / 5) * 100, 100);

  return (
    <div className="agora-card p-6 font-mono">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-md font-medium tracking-wide text-white">BTC-PERP</h2>
        <StatusBadge status={status} text={statusText} />
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        <div>
          <p className="text-[10px] text-[#787878] uppercase tracking-widest">Entry</p>
          <motion.p 
            key={data.entryPrice}
            initial={{ opacity: 0.5 }} animate={{ opacity: 1 }}
            className="text-sm"
          >${data.entryPrice.toLocaleString()}</motion.p>
        </div>
        <div>
          <p className="text-[10px] text-[#787878] uppercase tracking-widest">Price</p>
          <motion.p 
            key={data.currentPrice}
            initial={{ opacity: 0.5 }} animate={{ opacity: 1 }}
            className="text-sm"
          >${data.currentPrice.toLocaleString()}</motion.p>
        </div>
        <div>
          <p className="text-[10px] text-[#787878] uppercase tracking-widest">Margin</p>
          <motion.p 
            key={data.marginRatio}
            initial={{ color: "#d4ff3e" }} animate={{ color: "#F2F2F2" }}
            className="text-sm agora-accent"
          >{(data.marginRatio * 100).toFixed(1)}%</motion.p>
        </div>
        <div>
          <p className="text-[10px] text-[#787878] uppercase tracking-widest">Leverage</p>
          <motion.p 
            key={data.leverage}
            initial={{ opacity: 0.5 }} animate={{ opacity: 1 }}
            className="text-sm"
          >{data.leverage.toFixed(1)}x</motion.p>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex justify-between text-[10px] text-[#787878] mb-1 uppercase tracking-widest">
          <span>Leverage Gauge</span>
        </div>
        <div className="w-full h-1 bg-[#1e1e1e] overflow-hidden">
          <motion.div 
            className="h-full" 
            initial={{ width: 0 }}
            animate={{ width: `${gaugeWidth}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            style={{ backgroundColor: status === 'critical' ? 'var(--color-neg)' : status === 'warning' ? 'var(--color-warn)' : 'var(--color-pos)' }} 
          />
        </div>
      </div>
    </div>
  );
};
