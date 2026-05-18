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
    <div className="bg-[#131822] border border-[#1E2532] rounded-xl p-5 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-lg">BTC-PERP Perpetual</h2>
        <div className={`w-3 h-3 rounded-full ${status.dot}`} style={{ backgroundColor: status.color }} />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[11px] text-[#8A93A3] uppercase">Entry Price</p>
          <p className="text-lg font-semibold">${data.entryPrice.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-[11px] text-[#8A93A3] uppercase">Current Price</p>
          <p className="text-lg font-semibold">${data.currentPrice.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-[11px] text-[#8A93A3] uppercase">Margin Ratio</p>
          <p className="text-lg font-semibold">{(data.marginRatio * 100).toFixed(1)}%</p>
        </div>
        <div>
          <p className="text-[11px] text-[#8A93A3] uppercase">Leverage</p>
          <p className="text-lg font-semibold">{data.leverage.toFixed(1)}x</p>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex justify-between text-[11px] text-[#8A93A3] mb-1">
          <span>LEVERAGE</span>
          <span style={{ color: status.color }}>{status.text}</span>
        </div>
        <div className="w-full h-1.5 bg-[#1E2532] rounded-full overflow-hidden">
          <div 
            className="h-full transition-all duration-300 ease-out" 
            style={{ width: `${gaugeWidth}%`, backgroundColor: status.color }} 
          />
        </div>
      </div>
    </div>
  );
};
