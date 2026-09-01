import { useState, useCallback, useMemo, useEffect, lazy, Suspense } from 'react';
import { useAnalyticsStore } from '@/stores/analyticsStore';
import { useWalletStore } from '@/stores/walletStore';
import { RescueMetricsCard } from '@/components/RescueMetricsCard';
import { PortfolioOverviewCard } from '@/components/PortfolioOverviewCard';
import { EventFeed } from '@/components/EventFeed';
import { EventStatsCard } from '@/components/EventStatsCard';
import { PositionsList } from '@/components/PositionsList';
import { Position } from '@/types/position';
import { useAgentSignals } from '@/hooks/useAgentSignals';
import { LiveMetricsHeader } from '@/components/LiveMetricsHeader';
import { RescuePath } from '@/components/RescuePath';
import { ReasoningTraceCard } from '@/components/ReasoningTraceCard';
import { MarketRegimeBadge } from '@/components/MarketRegimeBadge';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Shield, TrendingUp, Settings } from 'lucide-react';
import { triggerAlert } from '@/components/AlertSystem';
import { AgentSignal } from '@/types/agent';
import { PositionHealthCard } from '@/components/PositionHealthCard';

// Dynamic imports for heavy/hidden-by-default components using React.lazy —
// none of these need to be in the initial bundle: the charts are below the
// fold, the modals start closed, the strategy panel is toggle-gated, and the
// crash simulator is a below-the-fold demo control.
const MarginHistoryChart = lazy(() => import('@/components/MarginHistoryChart').then(mod => ({ default: mod.MarginHistoryChart })));
const LeverageChart = lazy(() => import('@/components/LeverageChart').then(mod => ({ default: mod.LeverageChart })));
const MockCrashSimulator = lazy(() => import('@/components/MockCrashSimulator').then(mod => ({ default: mod.MockCrashSimulator })));
const PositionDetailModal = lazy(() => import('@/components/PositionDetailModal').then(mod => ({ default: mod.PositionDetailModal })));
const ModeToggleModal = lazy(() => import('@/components/ModeToggleModal').then(mod => ({ default: mod.ModeToggleModal })));
const StrategyControlPanel = lazy(() => import('@/components/StrategyControlPanel').then(mod => ({ default: mod.StrategyControlPanel })));

// recharts' ResponsiveContainer/curve-positioning cost (getBoundingClientRect,
// getTotalLength) is real and unavoidable per-chart, but mounting both charts
// in the same commit as the rest of the dashboard means that cost lands in
// the same long task as everything else's initial paint. Deferring their
// mount to the next idle slot lets the rest of the dashboard (KPIs, position
// health, reasoning trace) paint first, uninterrupted.
function useIdleMount(timeout = 1000) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const ric: (cb: () => void, opts?: { timeout: number }) => number =
      (window as any).requestIdleCallback || ((cb) => window.setTimeout(cb, 1));
    const cic: (id: number) => void = (window as any).cancelIdleCallback || window.clearTimeout;
    const id = ric(() => setReady(true), { timeout });
    return () => cic(id);
  }, []);
  return ready;
}

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
  const chartsReady = useIdleMount();

  const [rescueStage, setRescueStage] = useState<'idle' | 'pinning' | 'releasing' | 'bridging' | 'complete'>('idle');
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [agentMode, setAgentMode] = useState<'sentinel' | 'trading'>('sentinel');
  const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);
  const [pendingMode, setPendingMode] = useState<'sentinel' | 'trading'>('sentinel');
  const [btcPrice, setBtcPrice] = useState(63200);
  const [showStrategyPanel, setShowStrategyPanel] = useState(false);

  const [simulatedSignals, setSimulatedSignals] = useState<AgentSignal[]>([]);
  const [isRescuing, setIsRescuing] = useState(false);

  const combinedSignals = useMemo(() => {
    if (connectionStatus === 'connected') return signals;
    return [...simulatedSignals, ...signals];
  }, [signals, simulatedSignals, connectionStatus]);

  const combinedLifetimeCount = useMemo(() => {
    if (connectionStatus === 'connected') return lifetimeCount;
    return lifetimeCount + simulatedSignals.length;
  }, [lifetimeCount, simulatedSignals, connectionStatus]);

  const combinedLifetimeStats = useMemo(() => {
    if (connectionStatus === 'connected') return lifetimeStats;
    const stats = { ...lifetimeStats };
    simulatedSignals.forEach((sig) => {
      if (sig.event_type) {
        stats[sig.event_type] = (stats[sig.event_type] || 0) + 1;
      }
    });
    return stats;
  }, [lifetimeStats, simulatedSignals, connectionStatus]);

  // Local/Simulation monitoring loop
  useEffect(() => {
    if (connectionStatus === 'connected') return;

    // Retrieve onboarding info to check if isMock is active
    const onboarding = useWalletStore.getState().onboardingData;
    const isMockMode = onboarding?.isMock !== false; // Default to true if not specified

    if (!isMockMode) return;

    const btcPosition = useAnalyticsStore.getState().livePositions['BTC'];
    if (!btcPosition) return;

    const size = btcPosition.size;
    const entryPrice = btcPosition.entryPrice;
    const pnl = size * (btcPrice - entryPrice);

    // Calculate new margin ratio & leverage
    const newMarginRatio = Math.max(0.01, (btcPosition.collateral + pnl) / (size * btcPrice));
    const newLeverage = Math.min(20, (size * btcPrice) / (btcPosition.collateral + pnl));

    // Update the position in analytics store
    useAnalyticsStore.getState().updateLivePosition('BTC', {
      current_price: btcPrice,
      margin_ratio: newMarginRatio,
      leverage: newLeverage,
      unrealized_pnl: pnl
    });

    // Update global positionMetrics as well
    const otherCollateral = 17000 + 6500; // ETH and SOL collaterals
    const totalCollateral = btcPosition.collateral + otherCollateral + pnl;
    const totalValue = (btcPrice * size) + (3400 * 15.0) + (150 * 150.0);
    const avgMarginRatio = totalCollateral / totalValue;
    const avgLeverage = totalValue / totalCollateral;

    useAnalyticsStore.getState().updatePositionMetrics({
      totalValue,
      avgMarginRatio: Math.max(0.01, avgMarginRatio),
      avgLeverage: Math.max(1, avgLeverage),
      criticalPositions: newMarginRatio < 0.12 ? 1 : 0
    });

    // Push margin and leverage history data points
    useAnalyticsStore.getState().addMarginHistory(Date.now(), newMarginRatio);
    useAnalyticsStore.getState().addLeverageHistory(Date.now(), newLeverage);

    // Trigger simulated rescue if margin ratio goes below 12% critical threshold
    if (newMarginRatio < 0.12 && !isRescuing) {
      setIsRescuing(true);
      const rescueStart = performance.now(); // High-resolution timer for real measurement

      // 1. PINNING STAGE — immediate (0ms)
      setRescueStage('pinning');

      const t0 = Date.now();
      const verdictSignal: AgentSignal = {
        type: 'RiskVerdict' as any,
        event_type: 'RiskVerdict',
        timestamp: t0 / 1000,
        data: { status: 'CRITICAL', reason: `BTC margin ratio fell to ${(newMarginRatio * 100).toFixed(2)}% (< 12.00%). Sentinel rescue triggered.` },
        payload: { status: 'CRITICAL', reason: `BTC margin ratio fell to ${(newMarginRatio * 100).toFixed(2)}% (< 12.00%). Sentinel rescue triggered.` }
      };

      const traceSignal: AgentSignal = {
        type: 'ReasoningTrace' as any,
        event_type: 'ReasoningTrace',
        timestamp: t0 / 1000,
        data: { hash: '0x' + Math.random().toString(16).substring(2, 10) + '...', verdict: 'RESCUE_REQUIRED' },
        payload: { hash: '0x' + Math.random().toString(16).substring(2, 10) + '...', verdict: 'RESCUE_REQUIRED' }
      };

      setSimulatedSignals(prev => [verdictSignal, traceSignal, ...prev]);

      triggerAlert({
        type: 'system',
        title: 'Emergency Verdict',
        message: `Risk engine: BTC margin at ${(newMarginRatio * 100).toFixed(2)}% — sub-300ms rescue initiated`,
        severity: 'critical',
      });

      useAnalyticsStore.getState().updateLatestReasoningTrace({
        hash: '0x' + Math.random().toString(16).substring(2, 10) + '...',
        reasoning: `BTC margin ratio fell to ${(newMarginRatio * 100).toFixed(2)}% (under 12% safety band). Initiating sub-300ms USDC vault release via Circle Developer-Controlled Wallets.`,
        timestamp: t0 / 1000,
        verdict: 'RESCUE_REQUIRED'
      });

      // 2. RELEASING STAGE — 80ms (Circle vault unlock)
      setTimeout(() => {
        setRescueStage('releasing');

        const releaseSignal: AgentSignal = {
          type: 'RescueInitiated' as any,
          event_type: 'RescueInitiated',
          timestamp: Date.now() / 1000,
          data: { symbol: 'BTC', amount: 7500 },
          payload: { symbol: 'BTC', amount: 7500 }
        };

        setSimulatedSignals(prev => [releaseSignal, ...prev]);

        triggerAlert({
          type: 'rescue',
          title: 'Rescue Initiated',
          message: 'Circle Vault unlocking 7,500 USDC for BTC margin injection',
          severity: 'high',
        });
      }, 80);

      // 3. BRIDGING STAGE — 160ms (Arc cross-chain relay)
      setTimeout(() => {
        setRescueStage('bridging');

        const bridgeSignal: AgentSignal = {
          type: 'BridgeInitiated' as any,
          event_type: 'BridgeInitiated',
          timestamp: Date.now() / 1000,
          data: { txHash: '0x' + Math.random().toString(16).substring(2, 12) },
          payload: { txHash: '0x' + Math.random().toString(16).substring(2, 12) }
        };

        setSimulatedSignals(prev => [bridgeSignal, ...prev]);
      }, 160);

      // 4. COMPLETE STAGE — 240ms total (actual wall-clock measured)
      setTimeout(() => {
        const rescueLatencyMs = Math.round(performance.now() - rescueStart);
        setRescueStage('complete');

        const completeSignal: AgentSignal = {
          type: 'RescueComplete' as any,
          event_type: 'RescueComplete',
          timestamp: Date.now() / 1000,
          data: { symbol: 'BTC', amount: 7500, latencyMs: rescueLatencyMs },
          payload: { symbol: 'BTC', amount: 7500, latencyMs: rescueLatencyMs }
        };

        setSimulatedSignals(prev => [completeSignal, ...prev]);

        // Update metrics with the REAL measured latency (not a constant)
        const metrics = useAnalyticsStore.getState().rescueMetrics;
        const newCount = metrics.totalRescues + 1;
        const newAvgLatency = Math.round(
          (metrics.avgLatency * metrics.totalRescues + rescueLatencyMs) / newCount
        );
        useAnalyticsStore.getState().updateRescueMetrics({
          totalRescues: newCount,
          totalRescued: metrics.totalRescued + 7500,
          avgLatency: newAvgLatency
        });

        // Inject 7,500 USDC into BTC collateral
        useAnalyticsStore.getState().updateLivePosition('BTC', {
          collateral: btcPosition.collateral + 7500
        });

        triggerAlert({
          type: 'success',
          title: `Rescue Complete · ${rescueLatencyMs}ms`,
          message: '7,500 USDC injected into BTC collateral via Circle Vault',
          severity: 'low',
        });

        // Reset rescue state after visual cooldown
        setTimeout(() => {
          setRescueStage('idle');
          setIsRescuing(false);
        }, 2000);

      }, 240);
    }

  }, [btcPrice, connectionStatus, isRescuing]);

  // Map latest signals to rescue stages for visual progress
  useEffect(() => {
    const lastSignal = combinedSignals[0];
    if (!lastSignal) return;

    if (lastSignal.event_type === 'ReasoningTrace') setRescueStage('pinning');
    if (lastSignal.event_type === 'RescueInitiated') setRescueStage('releasing');
    if (lastSignal.event_type === 'BridgeInitiated') setRescueStage('bridging');
    if (lastSignal.event_type === 'RescueComplete') setRescueStage('complete');

    if (lastSignal.event_type === 'MODE_CHANGED') {
      setAgentMode(lastSignal.payload.mode);
    }
  }, [combinedSignals]);



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

  const handlePositionClose = useCallback((id: string) => { }, []);
  const handleAddMargin = useCallback((id: string) => { }, []);
  const handleDeleverage = useCallback((id: string) => { }, []);

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
        <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${connectionStatus === 'connected' ? 'bg-pos' : 'bg-[#787878]'}`} />
            <span className="text-[10px] text-[#787878] uppercase tracking-widest font-bold">
              {connectionStatus === 'connected' ? 'Live Sentinel Active' : 'Connecting to Node...'}
            </span>
          </div>

        <div className="flex items-center gap-4 bg-[#1e1e1e]/50 backdrop-blur-md p-1 rounded-2xl border border-white/5">
          <MarketRegimeBadge regime={marketRegime} volatility={Object.values(volatility)[0] || 0.2} />
          <div className="h-6 w-px bg-white/10" />
          <div className="flex gap-1 p-0.5">
            <button
              onClick={() => agentMode !== 'sentinel' && toggleAgentMode()}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${agentMode === 'sentinel'
                  ? 'bg-accent text-white shadow-[0_0_20px_var(--accent)]'
                  : 'text-muted hover:text-white hover:bg-white/5'
                }`}
            >
              <Shield size={12} />
              Sentinel
            </button>
            <button
              onClick={() => agentMode !== 'trading' && toggleAgentMode()}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${agentMode === 'trading'
                  ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                  : 'text-muted hover:text-white hover:bg-white/5'
                }`}
            >
              <TrendingUp size={12} />
              Trading Agent
            </button>
          </div>
          <div className="h-6 w-px bg-white/10" />
          <button
            onClick={() => setShowStrategyPanel(!showStrategyPanel)}
            className={`p-2 rounded-xl transition-all ${showStrategyPanel ? 'bg-white/10 text-white' : 'text-muted hover:text-white hover:bg-white/5'}`}
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Metrics header — the one real implementation (LiveMetricsHeader),
          fed straight from the event-driven backend metric via useAgentSignals
          + analyticsStore. Previously this was a second, ad-hoc KPI row that
          duplicated LiveMetricsHeader (which sat imported but unused) and
          additionally clamped the latency display to a fake "999ms" ceiling. */}
      <LiveMetricsHeader
        latencyMs={rescueMetrics.avgLatency}
        totalRescued={rescueMetrics.totalRescued}
        agentStatus={connectionStatus === 'connected' ? (agentMode === 'trading' ? 'TRADING' : 'PROTECTING') : 'OFFLINE'}
        connectionStatus={connectionStatus}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-stretch">
        <div className="xl:col-span-1 space-y-8">
          <RescuePath stage={rescueStage} />
          {showStrategyPanel ? (
            <Suspense fallback={<div className="h-[300px] w-full bg-white/5 animate-pulse rounded-2xl" />}>
              <StrategyControlPanel />
            </Suspense>
          ) : (
            <PositionHealthCard />
          )}
        </div>
        <div className="xl:col-span-2 h-full">
          {latestReasoningTrace ? (
            <div className="h-full">
              <ReasoningTraceCard data={latestReasoningTrace} />
            </div>
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
        <div className="flex flex-col gap-12">
          <div className="w-full">
            <PortfolioOverviewCard
              totalValue={positionMetrics.totalValue}
              avgMarginRatio={positionMetrics.avgMarginRatio}
              avgLeverage={positionMetrics.avgLeverage}
              positionCount={positionMetrics.positionCount}
              criticalPositions={positionMetrics.criticalPositions}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {chartsReady ? (
              <>
                <Suspense fallback={<div className="h-[300px] w-full bg-white/5 animate-pulse rounded-2xl" />}>
                  <MarginHistoryChart data={marginHistory} />
                </Suspense>
                <Suspense fallback={<div className="h-[300px] w-full bg-white/5 animate-pulse rounded-2xl" />}>
                  <LeverageChart data={leverageHistory} />
                </Suspense>
              </>
            ) : (
              <>
                <div className="h-[300px] w-full bg-white/5 animate-pulse rounded-2xl" />
                <div className="h-[300px] w-full bg-white/5 animate-pulse rounded-2xl" />
              </>
            )}
          </div>

          <div className="w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white tracking-tight">Open Positions</h2>
              <div className="px-3 py-1 rounded-full bg-pos/10 border border-pos/20 text-pos text-[10px] font-bold uppercase tracking-widest">
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
        </div>
      </ProtectedRoute>

      <Suspense fallback={null}>
        <PositionDetailModal
          position={selectedPosition}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddMargin={handleAddMargin}
          onDeleverage={handleDeleverage}
          onClosePosition={handlePositionClose}
        />
      </Suspense>

      <Suspense fallback={null}>
        <ModeToggleModal
          isOpen={isToggleModalOpen}
          onClose={() => setIsToggleModalOpen(false)}
          onConfirm={handleToggleConfirm}
          targetMode={pendingMode}
        />
      </Suspense>

      <div>
        <h2 className="text-xl font-bold text-white mb-6 tracking-tight">Live Event Monitoring</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <EventFeed events={combinedSignals} maxItems={15} />
          </div>
          <EventStatsCard events={combinedSignals} lifetimeCount={combinedLifetimeCount} lifetimeStats={combinedLifetimeStats} />
        </div>
      </div>

      <div className="pt-8 border-t border-white/5">
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-xl font-bold text-white tracking-tight">System Stress Verification</h2>
          <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[8px] font-bold uppercase tracking-widest">
            Simulation Controller
          </span>
        </div>
        <Suspense fallback={<div className="h-24 w-full bg-white/5 animate-pulse rounded-2xl" />}>
          <MockCrashSimulator />
        </Suspense>
      </div>

      <footer className="border-t border-white/5 bg-black/20 py-8 mt-12">
        <div className="container mx-auto px-6 text-center text-sm text-[#484848]">
          <p className="font-bold text-muted mb-1 tracking-widest uppercase text-[10px]">GLASS</p>
          <p>Gateway Liquidation Autonomous Safety Sentinel</p>
          <p className="mt-1">Sub-500ms rescue • Glass-Box transparency • Arc Network verified</p>
        </div>
      </footer>
    </main>
  );
}
