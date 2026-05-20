import { useState, useCallback, useMemo, useEffect, lazy, Suspense } from 'react';
import { useAnalyticsStore } from '@/stores/analyticsStore';
import { useWalletStore } from '@/stores/walletStore';
import { RescueMetricsCard } from '@/components/RescueMetricsCard';
import { PortfolioOverviewCard } from '@/components/PortfolioOverviewCard';
import { EventFeed } from '@/components/EventFeed';
import { EventStatsCard } from '@/components/EventStatsCard';
import { PositionsList } from '@/components/PositionsList';
import { Position } from '@/types/position';
import { MockCrashSimulator } from '@/components/MockCrashSimulator';
import { useAgentSignals } from '@/hooks/useAgentSignals';
import { LiveMetricsHeader } from '@/components/LiveMetricsHeader';
import { RescuePath } from '@/components/RescuePath';
import { ReasoningTraceCard } from '@/components/ReasoningTraceCard';
import { PositionDetailModal } from '@/components/PositionDetailModal';
import { ModeToggleModal } from '@/components/ModeToggleModal';
import { MarketRegimeBadge } from '@/components/MarketRegimeBadge';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Shield, TrendingUp } from 'lucide-react';

// Dynamic imports for heavy chart components using React.lazy
const MarginHistoryChart = lazy(() => import('@/components/MarginHistoryChart').then(mod => ({ default: mod.MarginHistoryChart })));
const LeverageChart = lazy(() => import('@/components/LeverageChart').then(mod => ({ default: mod.LeverageChart })));

export default function Dashboard() {
  const { 
    rescueMetrics, 
    positionMetrics, 
    marketRegime, 
    volatility, 
    marginHistory, 
    leverageHistory, 
    updateRescueMetrics, 
    addMarginHistory, 
    addLeverageHistory,
    updateMarketIntelligence,
    updateLatestTrade 
  } = useAnalyticsStore();
  
  const { signals, lastSignal, status: connectionStatus, sendSignal, lifetimeCount, lifetimeStats } = useAgentSignals();
  
  const [rescueStage, setRescueStage] = useState<'idle' | 'pinning' | 'releasing' | 'bridging' | 'complete'>('idle');
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [agentMode, setAgentMode] = useState<'sentinel' | 'trading'>('sentinel');
  const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);
  const [pendingMode, setPendingMode] = useState<'sentinel' | 'trading'>('sentinel');
  const [btcPrice, setBtcPrice] = useState(63200);

  // Optimized signal processing: Only process the LATEST signal
  useEffect(() => {
    if (!lastSignal) return;
    
    const signal = lastSignal;

    // 1. Handle Analytics Updates
    if (signal.event_type === 'ANALYTICS_UPDATE') {
        updateRescueMetrics({
            totalRescued: signal.payload.total_rescued_usdc,
            avgLatency: signal.payload.avg_latency_ms,
            totalRescues: signal.payload.rescue_count,
        });
    }

    // 2. Handle Position Updates (Add to history)
    if (signal.event_type === 'PositionUpdate') {
      addMarginHistory(signal.timestamp * 1000, signal.payload.margin_ratio);
      addLeverageHistory(signal.timestamp * 1000, signal.payload.leverage);
    }

    // 3. Map signals to rescue stages for visual progress
    if (signal.event_type === 'ReasoningTrace') setRescueStage('pinning');
    if (signal.event_type === 'RescueInitiated') setRescueStage('bridging');
    if (signal.event_type === 'RescueComplete') setRescueStage('complete');
    
    // 4. Handle Mode Changes
    if (signal.event_type === 'MODE_CHANGED') {
        setAgentMode(signal.payload.mode);
    }

    // 5. Handle Volatility & Regime Updates
    if (signal.event_type === 'MarketVolatilityUpdate') {
        updateMarketIntelligence(marketRegime, signal.payload.volatility_factor);
    }
    if (signal.event_type === 'MarketRegimeUpdate') {
        updateMarketIntelligence(signal.payload.regime, volatility);
    }
    if (signal.event_type === 'TradingSignal') {
        updateLatestTrade(signal.payload);
    }
  }, [lastSignal, marketRegime, volatility, updateRescueMetrics, addMarginHistory, addLeverageHistory, updateMarketIntelligence, updateLatestTrade]); 

  // Find latest reasoning trace for display
  const latestTrace = useMemo(() => {
    const trace = signals.find(s => s.event_type === 'ReasoningTrace');
    if (trace) {
      const data = { ...trace.data };
      if (typeof data.reasoning_text === 'string') {
        try {
          data.reasoning_text = JSON.parse(data.reasoning_text);
        } catch (e) {}
      }
      return data;
    }
    return null;
  }, [signals]);

  const { isConnected, setIsModalOpen, isModalOpen } = useWalletStore();

  const handleToggleConfirm = () => {
    sendSignal('TOGGLE_MODE', { mode: pendingMode });
  };

  const toggleAgentMode = useCallback(() => {
    if (!isConnected) {
      setIsModalOpen(true);
      return;
    }
    
    const nextMode = agentMode === 'sentinel' ? 'trading' : 'sentinel';
    const skipWarning = localStorage.getItem('skipModeToggleWarning') === 'true';

    if (skipWarning) {
      sendSignal('TOGGLE_MODE', { mode: nextMode });
    } else {
      setPendingMode(nextMode);
      setIsToggleModalOpen(true);
    }
  }, [agentMode, sendSignal, isConnected, setIsModalOpen]);

  const { marginRatio, leverage } = useMemo(() => {
    const marginRatio = Math.max(0.05, 0.35 - (63200 - btcPrice) / 100000);
    const leverage = 50000 / (btcPrice * marginRatio);
    return { marginRatio, leverage };
  }, [btcPrice]);

  // Mock positions for demonstration
  const entryPrice = 60000;
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
        side: 'LONG',
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
        side: 'LONG',
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
        side: 'LONG',
      },
    ],
    [btcPrice, marginRatio, leverage]
  );

  const handlePositionClose = useCallback((id: string) => {}, []);
  const handleAddMargin = useCallback((id: string) => {}, []);
  const handleDeleverage = useCallback((id: string) => {}, []);

  const handlePositionClick = useCallback((id: string) => {
    const pos = positions.find(p => p.id === id);
    if (pos) {
      setSelectedPosition(pos);
      setIsModalOpen(true);
    }
  }, [positions, setIsModalOpen]);

  return (
    <main className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Sentinel Dashboard</h1>
          <div className="flex items-center gap-2 mt-1">
            <div className={`w-2 h-2 rounded-full animate-pulse ${signals.length > 0 ? 'bg-[#00D98F]' : 'bg-[#787878]'}`} />
            <span className="text-[10px] text-[#787878] uppercase tracking-widest">
              {signals.length > 0 ? 'Live Sentinel Connected' : 'Waiting for Sentinel...'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-[#1e1e1e] p-1 rounded-xl border border-white/5">
          <MarketRegimeBadge regime={marketRegime} volatility={volatility} />
          <div className="h-6 w-px bg-white/10" />
          <button
            onClick={() => agentMode !== 'sentinel' && toggleAgentMode()}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              agentMode === 'sentinel' 
                ? 'bg-[#00A3FF] text-white shadow-lg' 
                : 'text-[#8A93A3] hover:text-white'
            }`}
          >
            <Shield size={14} />
            Sentinel
          </button>
          <button
            onClick={() => agentMode !== 'trading' && toggleAgentMode()}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              agentMode === 'trading' 
                ? 'bg-purple-600 text-white shadow-lg' 
                : 'text-[#8A93A3] hover:text-white'
            }`}
          >
            <TrendingUp size={14} />
            Trading Agent
          </button>
        </div>
      </div>

      <LiveMetricsHeader 
        latencyMs={rescueMetrics.avgLatency}
        totalRescued={rescueMetrics.totalRescued}
        agentStatus={agentMode === 'trading' ? "TRADING" : (rescueMetrics.totalRescues > 0 ? "PROTECTING" : "IDLE")}
        agentName={agentMode.toUpperCase()}
        connectionStatus={connectionStatus}
      />
      
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

      <ProtectedRoute>
        <PortfolioOverviewCard
          totalValue={positionMetrics.totalValue}
          avgMarginRatio={positionMetrics.avgMarginRatio}
          avgLeverage={positionMetrics.avgLeverage}
          positionCount={positionMetrics.positionCount}
          criticalPositions={positionMetrics.criticalPositions}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Suspense fallback={<div className="h-[300px] w-full bg-white/5 animate-pulse rounded-2xl" />}>
            <MarginHistoryChart data={marginHistory} />
          </Suspense>
          <Suspense fallback={<div className="h-[300px] w-full bg-white/5 animate-pulse rounded-2xl" />}>
            <LeverageChart data={leverageHistory} />
          </Suspense>
        </div>

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
      </ProtectedRoute>

      <PositionDetailModal
        position={selectedPosition}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddMargin={handleAddMargin}
        onDeleverage={handleDeleverage}
        onClosePosition={handlePositionClose}
      />

      <ModeToggleModal
        isOpen={isToggleModalOpen}
        onClose={() => setIsToggleModalOpen(false)}
        onConfirm={handleToggleConfirm}
        targetMode={pendingMode}
      />

      <div>
        <h2 className="text-xl font-semibold text-white mb-6">Live Event Monitoring</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <EventFeed events={signals} maxItems={15} />
          </div>
          <EventStatsCard events={signals} lifetimeCount={lifetimeCount} lifetimeStats={lifetimeStats} />
        </div>
      </div>

      <div className="pt-8 border-t border-[#1e1e1e]">
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-xl font-semibold text-white">System Verification</h2>
          <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[8px] font-bold uppercase tracking-widest">
            Judge Mode
          </span>
        </div>
        <MockCrashSimulator
          price={btcPrice}
          onPriceChange={setBtcPrice}
          onReset={() => setBtcPrice(63200)}
        />
      </div>
    </main>
  );
}
