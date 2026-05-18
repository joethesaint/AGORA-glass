'use client';

import { useState } from 'react';
import { ActivePositionsWidget } from '@/components/ActivePositionsWidget';
import { MockCrashSimulator } from '@/components/MockCrashSimulator';

export default function Dashboard() {
  const [btcPrice, setBtcPrice] = useState(63200);
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
    <main className="p-8 max-w-7xl mx-auto">
      <h2 className="text-xl font-semibold mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ActivePositionsWidget data={data} />
        <MockCrashSimulator 
            price={btcPrice} 
            onPriceChange={setBtcPrice} 
            onReset={() => setBtcPrice(63200)} 
        />
      </div>
    </main>
  );
}
