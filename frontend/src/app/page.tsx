'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useAnalyticsStore } from '@/stores/analyticsStore';
import { useWalletStore } from '@/stores/walletStore';
import { RescueMetricsCard } from '@/components/RescueMetricsCard';
import { MarginHistoryChart } from '@/components/MarginHistoryChart';
import { LeverageChart } from '@/components/LeverageChart';
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
import { Shield, TrendingUp, Zap } from 'lucide-react';

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
  const { signals, lifetimeCount, lifetimeStats, status: connectionStatus, sendSignal } = useAgentSignals();
  const [rescueStage, setRescueStage] = useState<'idle' | 'pinning' | 'releasing' | 'bridging' | 'complete'>('idle');
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [agentMode, setAgentMode] = useState<'sentinel' | 'trading'>('sentinel');
  const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);
  const [pendingMode, setPendingMode] = useState<'sentinel' | 'trading'>('sentinel');
  const [btcPrice, setBtcPrice] = useState(63200);

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
    signals.forEach((signal) => {
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
        
        // Remove automatic price update here so the simulator is the source of truth
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
    });
    
  }, [signals, updateRescueMetrics, addMarginHistory, addLeverageHistory, updateMarketIntelligence, updateLatestTrade]);

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

  // Mock event generator for live feel
  useEffect(() => {
    if (agentMode === 'sentinel') return; // Only mock trading signals when in trading mode

    const interval = setInterval(() => {
      const symbols = ['BTC-PERP', 'ETH-PERP', 'SOL-PERP'];
      const actions = ['BUY', 'SELL', 'DE_RISK'];
      
      const mockSignal = {
        event_type: 'TradingSignal',
        timestamp: Date.now() / 1000,
        payload: {
          symbol: symbols[Math.floor(Math.random() * symbols.length)],
          action: actions[Math.floor(Math.random() * actions.length)],
          reason: 'Market volatility detected',
          amount: Math.floor(Math.random() * 1000),
          price: btcPrice + (Math.random() * 100 - 50)
        }
      };

      // In a real app, signals would come from useAgentSignals websocket.
      // Here we simulate the effect for demonstration.
      console.log('🛡️ GLASS: Mock Trading Signal', mockSignal);
      updateLatestTrade(mockSignal.payload);
    }, 5000);

    return () => clearInterval(interval);
  }, [agentMode, btcPrice, updateLatestTrade]);

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
      {/* Page Title & Mode Switch */}
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

      {/* Mode Description */}
      <div className={`p-4 rounded-xl border animate-in fade-in slide-in-from-top-2 duration-500 ${
        agentMode === 'sentinel' 
          ? 'bg-blue-500/5 border-blue-500/20 text-blue-400' 
          : 'bg-purple-500/5 border-purple-500/20 text-purple-400'
      }`}>
        <div className="flex items-start gap-3">
          <Zap size={16} className="mt-0.5" />
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1">
              {agentMode === 'sentinel' ? 'Guardian Mode Active' : 'Autonomous Trading Mode Active'}
            </p>
            <p className="text-[11px] opacity-80 leading-relaxed text-white">
              {agentMode === 'sentinel' 
                ? 'The sentinel is monitoring your external Hyperliquid account. It will only act to inject USDC if a liquidation event is imminent.' 
                : 'The agent is proactively managing its own position. It will execute trades and de-risk automatically based on volatility trends.'}
            </p>
          </div>
        </div>
      </div>

      {/* Performance Header */}
      <LiveMetricsHeader 
        latencyMs={rescueMetrics.avgLatency}
        totalRescued={rescueMetrics.totalRescued}
        agentStatus={agentMode === 'trading' ? "TRADING" : (rescueMetrics.totalRescues > 0 ? "PROTECTING" : "IDLE")}
        agentName={agentMode.toUpperCase()}
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

      <ProtectedRoute>
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
      </ProtectedRoute>

      {/* Position Detail Modal */}
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

      {/* Events Section */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-6">Live Event Monitoring</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <EventFeed events={signals} maxItems={15} />
          </div>
          <EventStatsCard events={signals} lifetimeCount={lifetimeCount} lifetimeStats={lifetimeStats} />
        </div>
      </div>

      {/* Testing & Simulation (Judge Mode) */}
      <div className="pt-8 border-t border-[#1e1e1e]">
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-xl font-semibold text-white">System Verification</h2>
          <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[8px] font-bold uppercase tracking-widest">
            Judge Mode
          </span>
        </div>
        <p className="text-xs text-[#8A93A3] mb-8 max-w-xl">
          Use the simulator to verify the sentinel's responsiveness during extreme market conditions. Note: These controls are for auditing purposes and require authentication.
        </p>
        <MockCrashSimulator
          price={btcPrice}
          onPriceChange={setBtcPrice}
          onReset={() => setBtcPrice(63200)}
        />
      </div>
    </main>
  );
}
