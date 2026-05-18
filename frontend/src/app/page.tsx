'use client';

import { useState, useCallback, useMemo } from 'react';
import { useAnalyticsStore } from '@/stores/analyticsStore';
import { RescueMetricsCard } from '@/components/RescueMetricsCard';
import { MarginHistoryChart } from '@/components/MarginHistoryChart';
import { LeverageChart } from '@/components/LeverageChart';
import { PortfolioOverviewCard } from '@/components/PortfolioOverviewCard';
import { EventFeed } from '@/components/EventFeed';
import { EventStatsCard } from '@/components/EventStatsCard';
import { PositionsList, Position } from '@/components/PositionsList';
import { MockCrashSimulator } from '@/components/MockCrashSimulator';
import { useAgentSignals } from '@/hooks/useAgentSignals';

export default function Dashboard() {
  const { rescueMetrics, positionMetrics, marginHistory, leverageHistory } = useAnalyticsStore();
  const { signals } = useAgentSignals();

  const [btcPrice, setBtcPrice] = useState(63200);
  const entryPrice = 60000;
  const marginRatio = Math.max(0.05, 0.35 - (63200 - btcPrice) / 100000);
  const leverage = 50000 / (btcPrice * marginRatio);

  // Mock positions for demonstration
  const positions: Position[] = useMemo(
    () => [
      {
        id: 'pos_001',
        symbol: 'BTC-PERP',
        entryPrice,
        currentPrice: btcPrice,
        size: 1.5,
        marginRatio,
        leverage,
        collateral: 50000,
        unrealizedPnL: (btcPrice - entryPrice) * 1.5,
      },
      {
        id: 'pos_002',
        symbol: 'ETH-PERP',
        entryPrice: 3000,
        currentPrice: 3150,
        size: 10,
        marginRatio: 0.22,
        leverage: 4.1,
        collateral: 65000,
        unrealizedPnL: 1500,
      },
      {
        id: 'pos_003',
        symbol: 'SOL-PERP',
        entryPrice: 180,
        currentPrice: 175,
        size: 280,
        marginRatio: 0.18,
        leverage: 5.2,
        collateral: 35000,
        unrealizedPnL: -1400,
      },
    ],
    [btcPrice, marginRatio, leverage]
  );

  const handlePositionClose = useCallback((id: string) => {
    console.log('Close position:', id);
  }, []);

  const handleAddMargin = useCallback((id: string) => {
    console.log('Add margin to:', id);
  }, []);

  const handleDeleverage = useCallback((id: string) => {
    console.log('Deleverage:', id);
  }, []);

  return (
    <main className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Title */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#00D98F] rounded-full animate-pulse" />
          <span className="text-[10px] text-[#787878] uppercase tracking-widest">Live Sentinel</span>
        </div>
      </div>

      {/* Rescue Metrics */}
      <RescueMetricsCard
        totalRescued={rescueMetrics.totalRescued}
        avgLatency={rescueMetrics.avgLatency}
        successRate={rescueMetrics.successRate}
        totalRescues={rescueMetrics.totalRescues}
      />

      {/* Portfolio Overview */}
      <PortfolioOverviewCard
        totalValue={positionMetrics.totalValue}
        avgMarginRatio={positionMetrics.avgMarginRatio}
        avgLeverage={positionMetrics.avgLeverage}
        positionCount={positionMetrics.positionCount}
        criticalPositions={positionMetrics.criticalPositions}
      />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <MarginHistoryChart data={marginHistory} />
        <LeverageChart data={leverageHistory} />
      </div>

      {/* Positions Management */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-6">Open Positions</h2>
        <PositionsList
          positions={positions}
          onPositionClose={handlePositionClose}
          onAddMargin={handleAddMargin}
          onDeleverage={handleDeleverage}
        />
      </div>

      {/* Events Section */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-6">Event Monitoring</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <EventFeed events={signals} maxItems={15} />
          </div>
          <EventStatsCard events={signals} />
        </div>
      </div>

      {/* Testing & Simulation */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-6">Testing & Simulation</h2>
        <MockCrashSimulator
          price={btcPrice}
          onPriceChange={setBtcPrice}
          onReset={() => setBtcPrice(63200)}
        />
      </div>
    </main>
  );
}
