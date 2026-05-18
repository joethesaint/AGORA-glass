import React from 'react';

interface PositionData {
  entryPrice: number;
  currentPrice: number;
  size: number;
  marginRatio: number;
  leverage: number;
}

export const ActivePositionsWidget: React.FC<{ data: PositionData }> = ({ data }) => {
  const getStatus = (leverage: number) => {
    if (leverage > 5) return { text: "CRITICAL – Rescue needed", color: "#FF3B3B", dot: "animate-pulse" };
    if (leverage > 3) return { text: "Moderate", color: "#F5A623", dot: "" };
    return { text: "Safe", color: "#00D98F", dot: "" };
  };

  const status = getStatus(data.leverage);
  const gaugeWidth = Math.min((data.leverage / 5) * 100, 100);

  return (
    <div className="agora-card p-6 font-mono">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-md font-medium tracking-wide text-white">BTC-PERP</h2>
        <div className={`w-2 h-2 rounded-full ${status.dot}`} style={{ backgroundColor: status.color }} />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] text-[#787878] uppercase tracking-widest">Entry</p>
          <p className="text-sm">${data.entryPrice.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-[10px] text-[#787878] uppercase tracking-widest">Price</p>
          <p className="text-sm">${data.currentPrice.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-[10px] text-[#787878] uppercase tracking-widest">Margin</p>
          <p className="text-sm agora-accent">{(data.marginRatio * 100).toFixed(1)}%</p>
        </div>
        <div>
          <p className="text-[10px] text-[#787878] uppercase tracking-widest">Leverage</p>
          <p className="text-sm">{data.leverage.toFixed(1)}x</p>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex justify-between text-[10px] text-[#787878] mb-1 uppercase tracking-widest">
          <span>Leverage</span>
          <span style={{ color: status.color }}>{status.text}</span>
        </div>
        <div className="w-full h-1 bg-[#1e1e1e] overflow-hidden">
          <div 
            className="h-full transition-all duration-300 ease-out" 
            style={{ width: `${gaugeWidth}%`, backgroundColor: status.color }} 
          />
        </div>
      </div>
    </div>
  );
};
