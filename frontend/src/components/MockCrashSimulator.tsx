import React from 'react';
import { useWalletStore } from '@/stores/walletStore';
import { Lock, Zap } from 'lucide-react';
import { sendWebSocketSignal } from '@/hooks/useAgentSignals';

export const MockCrashSimulator: React.FC = () => {
  const { isConnected, setIsModalOpen } = useWalletStore();

  const handleCrash = (dropPercentage: number) => {
    sendWebSocketSignal('SIMULATE_FLASH_CRASH', { symbol: 'BTC-PERP', drop: dropPercentage });
  };
  
  const handleHedge = () => {
    sendWebSocketSignal('HEDGE_POSITION', { symbol: 'BTC-PERP', amount: 1.0 });
  };

  return (
    <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-5 mt-4 relative overflow-hidden">
      {!isConnected && (
        <div 
          className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center cursor-pointer group"
          onClick={() => setIsModalOpen(true)}
        >
          <Lock className="w-6 h-6 text-muted mb-2 group-hover:text-white transition-colors" />
          <p className="text-[10px] font-bold text-white uppercase tracking-widest">Authentication Required</p>
          <p className="text-[8px] text-muted mt-1">Connect wallet to access simulator controls</p>
        </div>
      )}
      
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-4 h-4 text-[#FF6B35]" />
        <h3 className="font-semibold text-md text-white">Live Operations Simulator</h3>
      </div>
      <p className="text-[11px] text-muted mb-4">Execute backend commands via WebSocket.</p>
      
      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={() => handleCrash(0.20)}
          className="py-2 px-3 bg-[#FF6B35]/10 border border-[#FF6B35]/30 hover:bg-[#FF6B35]/20 text-[#FF6B35] rounded-md text-xs font-bold uppercase tracking-wider transition-colors"
        >
          -20% Flash Crash
        </button>
        <button 
          onClick={() => handleCrash(0.40)}
          className="py-2 px-3 bg-neg/10 border border-neg/30 hover:bg-neg/20 text-neg rounded-md text-xs font-bold uppercase tracking-wider transition-colors"
        >
          -40% Liquidation
        </button>
        <button 
          onClick={handleHedge}
          className="py-2 px-3 bg-accent/10 border border-accent/30 hover:bg-accent/20 text-accent rounded-md text-xs font-bold uppercase tracking-wider transition-colors col-span-2"
        >
          Execute Manual Hedge (1.0 BTC)
        </button>
      </div>
    </div>
  );
};
