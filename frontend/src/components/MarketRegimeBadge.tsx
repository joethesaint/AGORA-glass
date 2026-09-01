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
      case 'EXTREME_VOLATILITY': return 'text-neg bg-neg/10 border-neg/20';
      case 'RISK_OFF': return 'text-warn bg-warn/10 border-warn/20';
      default: return 'text-pos bg-pos/10 border-pos/20';
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
