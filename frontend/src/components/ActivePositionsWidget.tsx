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
    <div className="bg-[#111111] border border-[#303030] rounded-none p-5 shadow-sm font-mono">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-semibold text-lg tracking-wider">BTC-PERP</h2>
        <div className={`w-3 h-3 rounded-full ${status.dot}`} style={{ backgroundColor: status.color }} />
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        <div>
          <p className="text-[11px] text-[#787878] uppercase">Entry</p>
          <p className="text-md">${data.entryPrice.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-[11px] text-[#787878] uppercase">Price</p>
          <p className="text-md">${data.currentPrice.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-[11px] text-[#787878] uppercase">Margin</p>
          <p className="text-md agora-accent">{(data.marginRatio * 100).toFixed(1)}%</p>
        </div>
        <div>
          <p className="text-[11px] text-[#787878] uppercase">Leverage</p>
          <p className="text-md">{data.leverage.toFixed(1)}x</p>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex justify-between text-[11px] text-[#787878] mb-1">
          <span className="uppercase">Leverage Gauge</span>
          <span style={{ color: status.color }}>{status.text}</span>
        </div>
        <div className="w-full h-1 bg-[#303030] rounded-none overflow-hidden">
          <div 
            className="h-full transition-all duration-300 ease-out" 
            style={{ width: `${gaugeWidth}%`, backgroundColor: status.color }} 
          />
        </div>
      </div>
    </div>
  );
};
