import { Shield, Activity } from 'lucide-react';

interface Props {
  regime: string;
  volatility: number;
}

export function MarketRegimeBadge({ regime, volatility }: Props) {
  const getColors = () => {
    switch (regime) {
      case 'EXTREME_VOLATILITY': 
        return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'RISK_OFF': 
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      default: 
        return 'text-green-500 bg-green-500/10 border-green-500/20';
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
}
