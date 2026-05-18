import React from 'react';

interface SimulatorProps {
  price: number;
  onPriceChange: (newPrice: number) => void;
  onReset: () => void;
}

export const MockCrashSimulator: React.FC<SimulatorProps> = ({ price, onPriceChange, onReset }) => {
  return (
    <div className="bg-[#131822] border border-[#1E2532] rounded-xl p-5 mt-4">
      <h3 className="font-semibold text-md mb-3">Flash Crash Simulator</h3>
      <label className="block text-[11px] text-[#8A93A3] uppercase mb-2">BTC Market Price: ${price.toLocaleString()}</label>
      <input 
        type="range" 
        min={40000} 
        max={80000} 
        step={100} 
        value={price} 
        onChange={(e) => onPriceChange(Number(e.target.value))}
        className="w-full h-2 bg-[#1E2532] rounded-lg appearance-none cursor-pointer accent-[#00A3FF]"
      />
      <button 
        onClick={onReset}
        className="mt-4 w-full py-2 bg-[#1E2532] hover:bg-[#2A3446] rounded-md text-sm font-medium transition-colors"
      >
        Reset to Safe
      </button>
    </div>
  );
};
