'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
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
import { LiveMetricsHeader } from '@/components/LiveMetricsHeader';
import { RescuePath } from '@/components/RescuePath';
import { ReasoningTraceCard } from '@/components/ReasoningTraceCard';
import { PositionDetailModal } from '@/components/PositionDetailModal';

export default function Dashboard() {
  const { rescueMetrics, positionMetrics, marginHistory, leverageHistory, updateRescueMetrics, addMarginHistory, addLeverageHistory } = useAnalyticsStore();
  const { signals, status: connectionStatus } = useAgentSignals();
  const [rescueStage, setRescueStage] = useState<'idle' | 'pinning' | 'releasing' | 'bridging' | 'complete'>('idle');
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Find latest reasoning trace for display
  const latestTrace = useMemo(() => {
    const trace = signals.find(s => s.event_type === 'ReasoningTrace');
    if (trace) {
      // Parse reasoning_text if it's a string
      const data = { ...trace.data };
      if (typeof data.reasoning_text === 'string') {
        try {
          data.reasoning_text = JSON.parse(data.reasoning_text);
        } catch (e) {
          // Keep as is if parsing fails
        }
      }
      return data;
    }
    return null;
  }, [signals]);

  // Listen for signals to update state
  useEffect(() => {
    const latestSignal = signals[0];
    if (!latestSignal) return;

    // 1. Handle Analytics Updates
    if (latestSignal.event_type === 'ANALYTICS_UPDATE') {
        updateRescueMetrics({
            totalRescued: latestSignal.payload.total_rescued_usdc,
            avgLatency: latestSignal.payload.avg_latency_ms,
            totalRescues: latestSignal.payload.rescue_count,
        });
    }

    // 2. Handle Position Updates (Add to history)
    if (latestSignal.event_type === 'PositionUpdate') {
      addMarginHistory(latestSignal.timestamp * 1000, latestSignal.payload.margin_ratio);
      addLeverageHistory(latestSignal.timestamp * 1000, latestSignal.payload.leverage);
    }

    // 3. Map signals to rescue stages for visual progress
    if (latestSignal.event_type === 'ReasoningTrace') setRescueStage('pinning');
    if (latestSignal.event_type === 'RescueInitiated') setRescueStage('bridging');
    if (latestSignal.event_type === 'RescueComplete') setRescueStage('complete');
    
  }, [signals, updateRescueMetrics, addMarginHistory, addLeverageHistory]);

  const [btcPrice, setBtcPrice] = useState(63200);
  const entryPrice = 60000;
  
  // Real-time calculated metrics from mock price
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

  const handlePositionClick = useCallback((id: string) => {
    const pos = positions.find(p => p.id === id);
    if (pos) {
      setSelectedPosition(pos);
      setIsModalOpen(true);
    }
  }, [positions]);

  return (
    <main className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Title */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Sentinel Dashboard</h1>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full animate-pulse ${signals.length > 0 ? 'bg-[#00D98F]' : 'bg-[#787878]'}`} />
          <span className="text-[10px] text-[#787878] uppercase tracking-widest">
            {signals.length > 0 ? 'Live Sentinel Connected' : 'Waiting for Sentinel...'}
          </span>
        </div>
      </div>

      {/* Performance Header */}
      <LiveMetricsHeader 
        latencyMs={rescueMetrics.avgLatency}
        totalRescued={rescueMetrics.totalRescued}
        agentStatus={rescueMetrics.totalRescues > 0 ? "PROTECTING" : "IDLE"}
        connectionStatus={connectionStatus}
      />
      
      {/* Rescue Flow & Latest Trace */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-1 space-y-8">
          <RescuePath stage={rescueStage} />
          <RescueMetricsCard
            totalRescued={rescueMetrics.totalRescued}
            avgLatency={rescueMetrics.avgLatency}
            successRate={rescueMetrics.successRate}
            totalRescues={rescueMetrics.totalRescues}
          />
        </div>
        <div className="xl:col-span-2">
          {latestTrace ? (
            <ReasoningTraceCard data={latestTrace} />
          ) : (
            <div className="h-full min-h-[300px] flex items-center justify-center border border-dashed border-[#1e1e1e] rounded-2xl text-[#484848] text-sm italic">
              No reasoning traces generated yet. Trigger a rescue to see "Glass-Box" transparency.
            </div>
          )}
        </div>
      </div>

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
          onPositionClick={handlePositionClick}
        />
      </div>

      {/* Position Detail Modal */}
      <PositionDetailModal
        position={selectedPosition}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddMargin={handleAddMargin}
        onDeleverage={handleDeleverage}
        onClosePosition={handlePositionClose}
      />

      {/* Events Section */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-6">Live Event Monitoring</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <EventFeed events={signals} maxItems={15} />
          </div>
          <EventStatsCard events={signals} />
        </div>
      </div>

      {/* Testing & Simulation */}
      <div className="pt-8 border-t border-[#1e1e1e]">
        <h2 className="text-xl font-semibold text-white mb-6">Control Panel (Simulation)</h2>
        <MockCrashSimulator
          price={btcPrice}
          onPriceChange={setBtcPrice}
          onReset={() => setBtcPrice(63200)}
        />
      </div>
    </main>
  );
}
