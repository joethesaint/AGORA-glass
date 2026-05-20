'use client';

import { useMemo, useState, useEffect } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Cell,
} from 'recharts';
import {
  Activity,
  TrendingUp,
  AlertTriangle,
  Target,
  Layers,
  Download,
  RefreshCw,
  Filter,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAgentSignals } from '@/hooks/useAgentSignals';

interface CorrelationData {
  asset1: string;
  asset2: string;
  correlation: number;
}

interface RiskHeatmapData {
  position: string;
  timeframe: string;
  risk: number;
  level: 'low' | 'medium' | 'high' | 'critical';
}

interface ScenarioData {
  scenario: string;
  pnl: number;
  probability: number;
  color: string;
}

interface AllocationData {
  name: string;
  value: number;
  color: string;
}

// Generate mock correlation data
const generateCorrelationData = (): { assets: string[]; data: CorrelationData[] } => {
  const assets = ['BTC', 'ETH', 'SOL', 'AVAX', 'MATIC', 'LINK', 'DOT', 'UNI'];
  const data: CorrelationData[] = [];
  
  assets.forEach((asset1) => {
    assets.forEach((asset2) => {
      const correlation = asset1 === asset2 ? 1 : Math.random() * 2 - 1;
      data.push({
        asset1,
        asset2,
        correlation: Math.round(correlation * 100) / 100,
      });
    });
  });
  
  return { assets, data };
};

// Generate risk heatmap data
const generateRiskHeatmap = (): { positions: string[]; timeframes: string[]; data: RiskHeatmapData[] } => {
  const positions = ['BTC-PERP', 'ETH-PERP', 'SOL-PERP', 'AVAX-PERP', 'MATIC-PERP'];
  const timeframes = ['1H', '4H', '8H', '12H', '24H'];
  const data: RiskHeatmapData[] = [];
  
  positions.forEach((position) => {
    timeframes.forEach((timeframe) => {
      const risk = Math.random();
      data.push({
        position,
        timeframe,
        risk: Math.round(risk * 100),
        level: risk < 0.3 ? 'low' : risk < 0.6 ? 'medium' : risk < 0.8 ? 'high' : 'critical',
      });
    });
  });
  
  return { positions, timeframes, data };
};

// Generate scenario analysis data
const generateScenarioData = (): ScenarioData[] => {
  return [
    { scenario: 'Base Case', pnl: 12500, probability: 50, color: '#00D98F' },
    { scenario: 'Bull (+20%)', pnl: 28000, probability: 25, color: '#00A3FF' },
    { scenario: 'Bear (-20%)', pnl: -8500, probability: 15, color: '#FF6B35' },
    { scenario: 'Crash (-40%)', pnl: -22000, probability: 7, color: '#FF3B3B' },
    { scenario: 'Moon (+50%)', pnl: 45000, probability: 3, color: '#A855F7' },
  ];
};

// Generate portfolio allocation data
const generateAllocationData = (): AllocationData[] => {
  return [
    { name: 'BTC', value: 35, color: '#FF6B35' },
    { name: 'ETH', value: 30, color: '#627EEA' },
    { name: 'SOL', value: 15, color: '#00D98F' },
    { name: 'AVAX', value: 10, color: '#E84142' },
    { name: 'Others', value: 10, color: '#8A93A3' },
  ];
};

const riskColors = {
  low: '#00D98F',
  medium: '#FFB800',
  high: '#FF6B35',
  critical: '#FF3B3B',
};

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

const StatCard = ({ title, value, subtitle, icon, trend }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-5"
  >
    <div className="flex items-start justify-between mb-3">
      <div className="p-2 bg-[#0a0907] rounded-lg">{icon}</div>
    </div>
    <p className="text-2xl font-bold text-white font-mono">{value}</p>
    <p className="text-xs text-[#8A93A3] mt-1">{title}</p>
    {subtitle && <p className="text-[10px] text-[#484848] mt-0.5">{subtitle}</p>}
  </motion.div>
);

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { signals, status } = useAgentSignals();

  // Dashboard state
  const [correlationData, setCorrelationData] = useState<{ assets: string[]; data: CorrelationData[] } | null>(null);
  const [riskHeatmap, setRiskHeatmap] = useState<{ positions: string[]; timeframes: string[]; data: RiskHeatmapData[] } | null>(null);
  const [scenarioData, setScenarioData] = useState<ScenarioData[] | null>(null);
  const [portfolioValue, setPortfolioValue] = useState(150000);
  const [sharpeRatio, setSharpeRatio] = useState(1.85);
  const [maxDrawdown, setMaxDrawdown] = useState(12.3);
  const [var95, setVar95] = useState(4500);
  const [allocationData, setAllocationData] = useState<AllocationData[] | null>(null);

  useEffect(() => {
    // Initialize data on mount
    setCorrelationData(generateCorrelationData());
    setRiskHeatmap(generateRiskHeatmap());
    setScenarioData(generateScenarioData());
    setAllocationData([
      { name: 'BTC', value: 35, color: '#FF6B35' },
      { name: 'ETH', value: 30, color: '#627EEA' },
      { name: 'SOL', value: 15, color: '#00D98F' },
      { name: 'AVAX', value: 10, color: '#E84142' },
      { name: 'Others', value: 10, color: '#8A93A3' },
    ]);
  }, []);

  useEffect(() => {
    // Process the latest signal
    const signal = signals[0];
    if (!signal) return;

    if (signal.event_type === 'MetricsUpdate') {
      const { portfolioValue, sharpeRatio, maxDrawdown, var95 } = signal.payload;
      if (portfolioValue) setPortfolioValue(portfolioValue);
      if (sharpeRatio) setSharpeRatio(sharpeRatio);
      if (maxDrawdown) setMaxDrawdown(maxDrawdown);
      if (var95) setVar95(var95);
    } else if (signal.event_type === 'AllocationUpdate') {
      setAllocationData(signal.payload.allocation);
    } else if (signal.event_type === 'RiskHeatmapUpdate') {
      setRiskHeatmap(signal.payload.heatmap);
    } else if (signal.event_type === 'CorrelationUpdate') {
      setCorrelationData(signal.payload.correlation);
    } else if (signal.event_type === 'ScenarioUpdate') {
      setScenarioData(signal.payload.scenarios);
    }
  }, [signals]);

  const portfolioMetrics = { totalValue: portfolioValue, sharpeRatio, maxDrawdown, var95 };


  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <main className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Advanced Analytics</h1>
          <p className="text-sm text-[#8A93A3] mt-1">
            Risk analysis, correlation matrices, and scenario modeling
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-xs text-[#8A93A3] uppercase">{status}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#111111] border border-[#1e1e1e] rounded-lg text-sm text-[#8A93A3] hover:border-[#00A3FF] hover:text-white transition-colors">
            <Filter size={14} />
            Filters
          </button>
          <button
            onClick={handleRefresh}
            className={`p-2 bg-[#111111] border border-[#1e1e1e] rounded-lg hover:border-[#00A3FF] transition-colors ${
              isLoading ? 'animate-spin' : ''
            }`}
          >
            <RefreshCw size={16} className="text-[#8A93A3]" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#111111] border border-[#1e1e1e] rounded-lg text-sm text-[#8A93A3] hover:border-[#00A3FF] hover:text-white transition-colors">
            <Download size={14} />
            Export
          </button>
        </div>
      </div>

      {/* Portfolio Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Portfolio Value"
          value={formatCurrency(portfolioMetrics.totalValue)}
          subtitle="Live via WebSocket"
          icon={<Layers size={18} className="text-[#00A3FF]" />}
        />
        <StatCard
          title="Sharpe Ratio"
          value={portfolioMetrics.sharpeRatio}
          subtitle="Risk-adjusted return"
          icon={<TrendingUp size={18} className="text-[#00D98F]" />}
        />
        <StatCard
          title="Max Drawdown"
          value={`${portfolioMetrics.maxDrawdown}%`}
          subtitle="Worst peak-to-trough"
          icon={<AlertTriangle size={18} className="text-[#FF6B35]" />}
        />
        <StatCard
          title="VaR (95%)"
          value={formatCurrency(portfolioMetrics.var95)}
          subtitle="Daily value at risk"
          icon={<Target size={18} className="text-[#FF3B3B]" />}
        />
      </div>

      {/* Risk Heatmap */}
      {riskHeatmap && (
        <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Activity size={16} className="text-[#FF6B35]" />
            Risk Heatmap by Position & Timeframe
          </h3>
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              <div className="grid grid-cols-6 gap-2">
                {/* Header row */}
                <div className="p-2"></div>
                {riskHeatmap.timeframes.map((tf) => (
                  <div
                    key={tf}
                    className="p-2 text-xs text-[#8A93A3] text-center font-mono"
                  >
                    {tf}
                  </div>
                ))}
                
                {/* Data rows */}
                {riskHeatmap.positions.map((position) => (
                  <div key={position} className="contents">
                    <div className="p-2 text-xs text-white font-mono text-right">
                      {position.slice(0, 7)}
                    </div>
                    {riskHeatmap.timeframes.map((tf) => {
                      const cellData = riskHeatmap.data.find(
                        (d) => d.position === position && d.timeframe === tf
                      );
                      return (
                        <div
                          key={`${position}-${tf}`}
                          className="p-2 text-center rounded-lg font-mono text-xs font-bold text-white"
                          style={{
                            backgroundColor: riskColors[cellData?.level as keyof typeof riskColors] || '#484848',
                          }}
                        >
                          {cellData?.risk}%
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            {Object.entries(riskColors).map(([level, color]) => (
              <div key={level} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs text-[#8A93A3] capitalize">{level}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Correlation Matrix & Scenario Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Correlation Matrix */}
        {correlationData && (
          <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Layers size={16} className="text-[#00A3FF]" />
              Asset Correlation Matrix
            </h3>
            <div className="overflow-x-auto">
              <div className="min-w-[400px]">
                <div className="grid grid-cols-5 gap-1">
                  {/* Header row */}
                  <div className="p-1"></div>
                  {correlationData.assets.slice(0, 8).map((asset) => (
                    <div
                      key={asset}
                      className="p-1 text-[10px] text-[#8A93A3] text-center font-mono"
                    >
                      {asset}
                    </div>
                  ))}
                  
                  {/* Data rows */}
                  {correlationData.assets.slice(0, 8).map((asset1) => (
                    <div key={asset1} className="contents">
                      <div className="p-1 text-[10px] text-white font-mono text-right">
                        {asset1}
                      </div>
                      {correlationData.assets.slice(0, 8).map((asset2) => {
                        const corr = correlationData.data.find(
                          (d) => d.asset1 === asset1 && d.asset2 === asset2
                        );
                        const intensity = corr ? Math.abs(corr.correlation) : 0;
                        const color = corr
                          ? corr.correlation > 0
                            ? `rgba(0, 217, 143, ${intensity})`
                            : `rgba(255, 59, 59, ${intensity})`
                          : 'transparent';
                        return (
                          <div
                            key={`${asset1}-${asset2}`}
                            className="p-1 text-center rounded text-[9px] font-mono text-white"
                            style={{ backgroundColor: color }}
                          >
                            {corr ? corr.correlation.toFixed(2) : '-'}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scenario Analysis */}
        {scenarioData && (
          <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Target size={16} className="text-[#FF6B35]" />
              Scenario Analysis
            </h3>
            <div className="space-y-4">
              {scenarioData.map((scenario) => (
                <div key={scenario.scenario} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white">{scenario.scenario}</span>
                    <span
                      className={`text-sm font-mono font-semibold ${
                        scenario.pnl >= 0 ? 'text-[#00D98F]' : 'text-[#FF3B3B]'
                      }`}
                    >
                      {scenario.pnl >= 0 ? '+' : ''}
                      {formatCurrency(scenario.pnl)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-[#0a0907] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${scenario.probability}%`,
                          backgroundColor: scenario.color,
                        }}
                      />
                    </div>
                    <span className="text-xs text-[#8A93A3] font-mono w-10 text-right">
                      {scenario.probability}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Portfolio Allocation Radar Chart */}
      {allocationData && (
        <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Activity size={16} className="text-[#00D98F]" />
            Portfolio Allocation
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={allocationData}>
                  <PolarGrid stroke="#1e1e1e" />
                  <PolarAngleAxis
                    dataKey="name"
                    tick={{ fill: '#8A93A3', fontSize: 12 }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 40]}
                    tick={{ fill: '#484848', fontSize: 10 }}
                    tickCount={4}
                  />
                  <Radar
                    name="Allocation"
                    dataKey="value"
                    stroke="#00A3FF"
                    fill="#00A3FF"
                    fillOpacity={0.3}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col justify-center space-y-4">
              {allocationData.map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-white flex-1">{item.name}</span>
                  <div className="flex-1 h-2 bg-[#0a0907] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${item.value}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                  <span className="text-sm font-mono text-[#8A93A3] w-12 text-right">
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}