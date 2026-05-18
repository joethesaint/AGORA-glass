'use client';

import { useState } from 'react';
import { useAgentSignals } from '@/hooks/useAgentSignals';
import { ActivePositionsWidget } from '@/components/ActivePositionsWidget';
import { MockCrashSimulator } from '@/components/MockCrashSimulator';
import { GlassBoxTerminal } from '@/components/GlassBoxTerminal';

export default function Dashboard() {
  const [btcPrice, setBtcPrice] = useState(63200);
  const { signals, status } = useAgentSignals();
  
  const entryPrice = 60000;
  const marginRatio = Math.max(0.05, 0.35 - (63200 - btcPrice) / 100000);
  const leverage = 50000 / (btcPrice * marginRatio);

  const data = {
    entryPrice,
    currentPrice: btcPrice,
    size: 1.5,
    marginRatio,
    leverage,
  };

  return (
    <main className="min-h-screen p-8 max-w-7xl mx-auto bg-[#0B0E14] text-[#F2F2F2]">
      <header className="flex justify-between items-center mb-10 border-b border-[#1E2532] pb-6">
        <div className='flex items-center gap-4'>
            <h1 className="text-2xl font-bold tracking-tight">AGORA-glass</h1>
            <div className={`px-2 py-1 rounded text-[10px] ${status === 'connected' ? 'bg-[#00D98F]/10 text-[#00D98F]' : 'bg-[#FF3B3B]/10 text-[#FF3B3B]'}`}>
                {status.toUpperCase()}
            </div>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-[#8A93A3] uppercase">Unified Balance</p>
          <p className="text-3xl font-bold text-[#00A3FF]">$12,450.00</p>
          <p className="text-[10px] text-[#8A93A3]">Gas-Free · Powered by Circle</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-8">
          <ActivePositionsWidget data={data} />
          <MockCrashSimulator 
            price={btcPrice} 
            onPriceChange={setBtcPrice} 
            onReset={() => setBtcPrice(63200)} 
          />
        </div>
        <div className="lg:col-span-5">
            <h3 className="font-semibold text-md mb-3 text-[#F2F2F2]">Glass-Box Transparency</h3>
          <GlassBoxTerminal signals={signals} />
        </div>
      </div>
    </main>
  );
}
