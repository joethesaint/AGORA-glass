import React, { useState, useEffect } from 'react';
import { useWalletStore } from '@/stores/walletStore';
import { Lock } from 'lucide-react';

interface SimulatorProps {
  price: number;
  onPriceChange: (newPrice: number) => void;
  onReset: () => void;
}

export const MockCrashSimulator: React.FC<SimulatorProps> = ({ price, onPriceChange, onReset }) => {
  const { isConnected, setIsModalOpen } = useWalletStore();
  const [localPrice, setLocalPrice] = useState(price);

  // Sync with prop if external price changes (e.g. reset)
  useEffect(() => {
    setLocalPrice(price);
  }, [price]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setLocalPrice(val);
    onPriceChange(val);
  };

  return (
    <div className="bg-[#131822] border border-[#1E2532] rounded-xl p-5 mt-4 relative overflow-hidden">
      {!isConnected && (
        <div 
          className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center cursor-pointer group"
          onClick={() => setIsModalOpen(true)}
        >
          <Lock className="w-6 h-6 text-[#8A93A3] mb-2 group-hover:text-white transition-colors" />
          <p className="text-[10px] font-bold text-white uppercase tracking-widest">Authentication Required</p>
          <p className="text-[8px] text-[#8A93A3] mt-1">Connect wallet to access simulator controls</p>
        </div>
      )}
      
      <h3 className="font-semibold text-md mb-3">Flash Crash Simulator</h3>
      <label className="block text-[11px] text-[#8A93A3] uppercase mb-2">BTC Market Price: ${localPrice.toLocaleString()}</label>
      <input 
        type="range" 
        min={40000} 
        max={80000} 
        step={100} 
        value={localPrice} 
        onChange={handleChange}
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
