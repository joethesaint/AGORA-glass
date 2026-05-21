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
import { StrategyControlPanel } from '@/components/StrategyControlPanel';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Shield, TrendingUp, Settings } from 'lucide-react';

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
    livePositions,
    latestReasoningTrace,
    updateRescueMetrics
  } = useAnalyticsStore();
  
  const { signals, status: connectionStatus, sendSignal, lifetimeCount, lifetimeStats } = useAgentSignals();
  
  const [rescueStage, setRescueStage] = useState<'idle' | 'pinning' | 'releasing' | 'bridging' | 'complete'>('idle');
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [agentMode, setAgentMode] = useState<'sentinel' | 'trading'>('sentinel');
  const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);
  const [pendingMode, setPendingMode] = useState<'sentinel' | 'trading'>('sentinel');
  const [btcPrice, setBtcPrice] = useState(63200);
  const [showStrategyPanel, setShowStrategyPanel] = useState(false);

  // Map latest signals to rescue stages for visual progress
  useEffect(() => {
    const lastSignal = signals[0];
    if (!lastSignal) return;

    if (lastSignal.event_type === 'ReasoningTrace') setRescueStage('pinning');
    if (lastSignal.event_type === 'RescueInitiated') setRescueStage('bridging');
    if (lastSignal.event_type === 'RescueComplete') setRescueStage('complete');
    
    if (lastSignal.event_type === 'MODE_CHANGED') {
        setAgentMode(lastSignal.payload.mode);
    }
  }, [signals]);

  // Demo auto-increment latency in development mode
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      const interval = setInterval(() => {
        updateRescueMetrics({ avgLatency: rescueMetrics.avgLatency + Math.floor(Math.random() * 10) + 1 });
      }, 4000);
      return () => clearInterval(interval);
    }
  }, []);

  const { isConnected, setIsModalOpen, isModalOpen } = useWalletStore();

  const handleToggleConfirm = () => {
    sendSignal('TOGGLE_MODE', { mode: pendingMode });
    setIsToggleModalOpen(false);
  };

  const toggleAgentMode = useCallback(() => {
    const nextMode = agentMode === 'sentinel' ? 'trading' : 'sentinel';
    const skipWarning = localStorage.getItem('skipModeToggleWarning') === 'true';

    if (skipWarning) {
      sendSignal('TOGGLE_MODE', { mode: nextMode });
    } else {
      setPendingMode(nextMode);
      setIsToggleModalOpen(true);
    }
  }, [agentMode, sendSignal]);

  // Real-time positions derived from signal stream
  const positions = useMemo(() => Object.values(livePositions), [livePositions]);

  const handlePositionClose = useCallback((id: string) => {}, []);
  const handleAddMargin = useCallback((id: string) => {}, []);
  const handleDeleverage = useCallback((id: string) => {}, []);

  const handlePositionClick = useCallback((id: string) => {
    const pos = positions.find(p => p.id === id);
    if (pos) {
      setSelectedPosition(pos as any);
      setIsModalOpen(true);
    }
  }, [positions, setIsModalOpen]);

  return (
    <main className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">GLASS Dashboard</h1>
          <div className="flex items-center gap-2 mt-1">
            <div className={`w-2 h-2 rounded-full animate-pulse ${connectionStatus === 'connected' ? 'bg-[#00D98F]' : 'bg-[#787878]'}`} />
            <span className="text-[10px] text-[#787878] uppercase tracking-widest font-bold">
              {connectionStatus === 'connected' ? 'Live Sentinel Active' : 'Connecting to Node...'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-[#1e1e1e]/50 backdrop-blur-md p-1 rounded-2xl border border-white/5">
          <MarketRegimeBadge regime={marketRegime} volatility={Object.values(volatility)[0] || 0.2} />
          <div className="h-6 w-px bg-white/10" />
          <div className="flex gap-1 p-0.5">
            <button
              onClick={() => agentMode !== 'sentinel' && toggleAgentMode()}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                agentMode === 'sentinel' 
                  ? 'bg-[#00A3FF] text-white shadow-[0_0_20px_rgba(0,163,255,0.3)]' 
                  : 'text-[#8A93A3] hover:text-white hover:bg-white/5'
              }`}
            >
              <Shield size={12} />
              Sentinel
            </button>
            <button
              onClick={() => agentMode !== 'trading' && toggleAgentMode()}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                agentMode === 'trading' 
                  ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]' 
                  : 'text-[#8A93A3] hover:text-white hover:bg-white/5'
              }`}
            >
              <TrendingUp size={12} />
              Trading Agent
            </button>
          </div>
          <div className="h-6 w-px bg-white/10" />
          <button 
            onClick={() => setShowStrategyPanel(!showStrategyPanel)}
            className={`p-2 rounded-xl transition-all ${showStrategyPanel ? 'bg-white/10 text-white' : 'text-[#8A93A3] hover:text-white hover:bg-white/5'}`}
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Refined Metrics Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Rescued", value: `$${rescueMetrics.totalRescued.toLocaleString()}`, sub: `${rescueMetrics.totalRescues} automated rescues`, color: "text-[#00A3FF]" },
          { label: "Avg Latency", value: `${rescueMetrics.avgLatency}ms`, sub: "Sub-500ms target", color: "text-[#F5A623]" },
          { label: "Efficiency", value: `${rescueMetrics.successRate}%`, sub: "Operational uptime", color: "text-[#00D98F]" },
          { label: "Sentinel", value: connectionStatus === 'connected' ? "ACTIVE" : "OFFLINE", sub: "Monitoring live risk", color: connectionStatus === 'connected' ? "text-[#00D98F]" : "text-[#FF3B3B]" }
        ].map((metric, i) => (
          <div key={i} className="agora-card p-4 space-y-1">
            <p className="text-[10px] font-bold text-[#8A93A3] uppercase tracking-widest">{metric.label}</p>
            <p className={`text-2xl font-black font-mono ${metric.color}`}>{metric.value}</p>
            <p className="text-[9px] text-[#484848] font-medium uppercase tracking-tighter">{metric.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        <div className="xl:col-span-1 space-y-8">
          <RescuePath stage={rescueStage} />
          {showStrategyPanel ? (
            <StrategyControlPanel />
          ) : (
            <PositionHealthCard />
          )}
        </div>
        <div className="xl:col-span-2">
          {latestReasoningTrace ? (
            <ReasoningTraceCard data={latestReasoningTrace} />
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center agora-card border-dashed border-white/5 text-[#484848] text-sm italic gap-4">
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-white/5 flex items-center justify-center">
                <Shield size={24} className="opacity-20" />
              </div>
              <p>Waiting for real-time reasoning traces from the Arc Network...</p>
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white tracking-tight">Open Positions</h2>
            <div className="px-3 py-1 rounded-full bg-[#00D98F]/10 border border-[#00D98F]/20 text-[#00D98F] text-[10px] font-bold uppercase tracking-widest">
                {positions.length} Active
            </div>
          </div>
          <PositionsList
            positions={positions as any}
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
        <h2 className="text-xl font-bold text-white mb-6 tracking-tight">Live Event Monitoring</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <EventFeed events={signals} maxItems={15} />
          </div>
          <EventStatsCard events={signals} lifetimeCount={lifetimeCount} lifetimeStats={lifetimeStats} />
        </div>
      </div>

      <div className="pt-8 border-t border-white/5">
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-xl font-bold text-white tracking-tight">System Stress Verification</h2>
          <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[8px] font-bold uppercase tracking-widest">
            Simulation Controller
          </span>
        </div>
        <MockCrashSimulator
          price={btcPrice}
          onPriceChange={setBtcPrice}
          onReset={() => setBtcPrice(63200)}
        />
      </div>

      <footer className="border-t border-white/5 bg-black/20 py-8 mt-12">
        <div className="container mx-auto px-6 text-center text-sm text-[#484848]">
          <p className="font-bold text-[#8A93A3] mb-1 tracking-widest uppercase text-[10px]">GLASS</p>
          <p>Gateway Liquidation Autonomous Safety Sentinel</p>
          <p className="mt-1">Sub-500ms rescue • Glass-Box transparency • Arc Network verified</p>
        </div>
      </footer>
    </main>
  );
}
