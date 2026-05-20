'use client';

import React from 'react';
import { Shield, Activity } from 'lucide-react';

interface Props {
  regime: string;
  volatility: number;
}

export const MarketRegimeBadge = ({ regime, volatility }: Props) => {
  const getColors = () => {
    switch (regime) {
      case 'EXTREME_VOLATILITY': return 'text-[#FF3B3B] bg-[#FF3B3B]/10 border-[#FF3B3B]/20';
      case 'RISK_OFF': return 'text-[#F5A623] bg-[#F5A623]/10 border-[#F5A623]/20';
      default: return 'text-[#00D98F] bg-[#00D98F]/10 border-[#00D98F]/20';
    }
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${getColors()}`}>
      <Shield size={12} />
      <span className="text-[10px] font-bold uppercase tracking-widest">{regime}</span>
      <span className="text-[10px] opacity-70">|</span>
      <Activity size={12} />
      <span className="text-[10px] font-mono">{(volatility * 100).toFixed(0)}% VOL</span>
    </div>
  );
};
