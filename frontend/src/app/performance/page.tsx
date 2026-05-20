'use client';

import { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  Clock,
  Shield,
  DollarSign,
  Activity,
  Calendar,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { motion } from 'framer-motion';

// Generate mock performance data
const generatePerformanceData = (days: number) => {
  const data = [];
  const now = Date.now();
  for (let i = days - 1; i >= 0; i--) {
    const timestamp = now - i * 86400000;
    data.push({
      date: new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      timestamp,
      rescued: Math.floor(Math.random() * 50000) + 10000,
      latency: Math.floor(Math.random() * 300) + 200,
      successRate: 95 + Math.random() * 4.5,
      rescues: Math.floor(Math.random() * 20) + 5,
      volume: Math.floor(Math.random() * 100000) + 50000,
    });
  }
  return data;
};

const generateHourlyData = () => {
  const data = [];
  const now = Date.now();
  for (let i = 23; i >= 0; i--) {
    const timestamp = now - i * 3600000;
    data.push({
      hour: new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      timestamp,
      rescues: Math.floor(Math.random() * 5) + 1,
      avgLatency: Math.floor(Math.random() * 200) + 300,
      marginAlerts: Math.floor(Math.random() * 10),
    });
  }
  return data;
};

const COLORS = ['#00A3FF', '#00D98F', '#FF6B35', '#FFB800', '#A855F7'];

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

const StatCard = ({ title, value, change, icon, trend }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-5"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="p-2 bg-[#0a0907] rounded-lg">{icon}</div>
      {change !== undefined && (
        <div
          className={`flex items-center gap-1 text-xs font-mono ${
            trend === 'up' ? 'text-[#00D98F]' : trend === 'down' ? 'text-[#FF3B3B]' : 'text-[#8A93A3]'
          }`}
        >
          {trend === 'up' ? (
            <ArrowUpRight size={12} />
          ) : trend === 'down' ? (
            <ArrowDownRight size={12} />
          ) : null}
          {Math.abs(change)}%
        </div>
      )}
    </div>
    <p className="text-2xl font-bold text-white font-mono">{value}</p>
    <p className="text-xs text-[#8A93A3] mt-1">{title}</p>
  </motion.div>
);

const timeRanges = [
  { label: '24H', value: 1 },
  { label: '7D', value: 7 },
  { label: '30D', value: 30 },
  { label: '90D', value: 90 },
];

export default function PerformancePage() {
  const [timeRange, setTimeRange] = useState(7);
  const [isLoading, setIsLoading] = useState(false);

  const performanceData = useMemo(() => generatePerformanceData(timeRange), [timeRange]);
  const hourlyData = useMemo(() => generateHourlyData(), []);

  const stats = useMemo(() => {
    const totalRescued = performanceData.reduce((sum, d) => sum + d.rescued, 0);
    const avgLatency =
      performanceData.reduce((sum, d) => sum + d.latency, 0) / performanceData.length;
    const avgSuccessRate =
      performanceData.reduce((sum, d) => sum + d.successRate, 0) / performanceData.length;
    const totalRescues = performanceData.reduce((sum, d) => sum + d.rescues, 0);

    return {
      totalRescued,
      avgLatency: Math.round(avgLatency),
      avgSuccessRate: avgSuccessRate.toFixed(1),
      totalRescues,
    };
  }, [performanceData]);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toLocaleString()}`;
  };

  return (
    <main className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Performance Analytics</h1>
          <p className="text-sm text-[#8A93A3] mt-1">
            Monitor rescue operations, latency metrics, and system performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-[#111111] border border-[#1e1e1e] rounded-lg p-1">
            {timeRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value)}
                className={`px-3 py-1.5 text-xs font-mono rounded-md transition-colors ${
                  timeRange === range.value
                    ? 'bg-[#00A3FF] text-white'
                    : 'text-[#8A93A3] hover:text-white'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Rescued"
          value={formatCurrency(stats.totalRescued)}
          change={12.5}
          trend="up"
          icon={<DollarSign size={18} className="text-[#00D98F]" />}
        />
        <StatCard
          title="Avg Latency"
          value={`${stats.avgLatency}ms`}
          change={-8.2}
          trend="up"
          icon={<Clock size={18} className="text-[#00A3FF]" />}
        />
        <StatCard
          title="Success Rate"
          value={`${stats.avgSuccessRate}%`}
          change={0.5}
          trend="up"
          icon={<Shield size={18} className="text-[#00D98F]" />}
        />
        <StatCard
          title="Total Rescues"
          value={stats.totalRescues}
          change={23}
          trend="up"
          icon={<Activity size={18} className="text-[#FF6B35]" />}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rescued Value Over Time */}
        <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-[#00D98F]" />
            Rescued Value Over Time
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="rescuedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00D98F" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00D98F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
                <XAxis
                  dataKey="date"
                  stroke="#484848"
                  fontSize={10}
                  tickLine={false}
                />
                <YAxis
                  stroke="#484848"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(v) => formatCurrency(v)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111111',
                    border: '1px solid #1e1e1e',
                    borderRadius: '8px',
                  }}
                  formatter={(value) => [formatCurrency(value as number), 'Rescued']}
                />
                <Area
                  type="monotone"
                  dataKey="rescued"
                  stroke="#00D98F"
                  fill="url(#rescuedGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Latency Over Time */}
        <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Clock size={16} className="text-[#00A3FF]" />
            Average Latency
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
                <XAxis
                  dataKey="date"
                  stroke="#484848"
                  fontSize={10}
                  tickLine={false}
                />
                <YAxis
                  stroke="#484848"
                  fontSize={10}
                  tickLine={false}
                  domain={[200, 600]}
                  tickFormatter={(v) => `${v}ms`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111111',
                    border: '1px solid #1e1e1e',
                    borderRadius: '8px',
                  }}
                  formatter={(value) => [`${value}ms`, 'Latency']}
                />
                <Line
                  type="monotone"
                  dataKey="latency"
                  stroke="#00A3FF"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Success Rate */}
        <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Shield size={16} className="text-[#00D98F]" />
            Success Rate Trend
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
                <XAxis
                  dataKey="date"
                  stroke="#484848"
                  fontSize={10}
                  tickLine={false}
                />
                <YAxis
                  stroke="#484848"
                  fontSize={10}
                  tickLine={false}
                  domain={[90, 100]}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111111',
                    border: '1px solid #1e1e1e',
                    borderRadius: '8px',
                  }}
                  formatter={(value) => [`${(value as number).toFixed(1)}%`, 'Success Rate']}
                />
                <Line
                  type="monotone"
                  dataKey="successRate"
                  stroke="#00D98F"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hourly Activity */}
        <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Activity size={16} className="text-[#FF6B35]" />
            Hourly Activity (Last 24h)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
                <XAxis
                  dataKey="hour"
                  stroke="#484848"
                  fontSize={10}
                  tickLine={false}
                />
                <YAxis
                  stroke="#484848"
                  fontSize={10}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111111',
                    border: '1px solid #1e1e1e',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="rescues" fill="#FF6B35" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Metrics Table */}
      <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Calendar size={16} className="text-[#00A3FF]" />
          Daily Performance Breakdown
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#0a0907] text-[#8A93A3]">
              <tr>
                <th className="text-left p-3 font-medium">Date</th>
                <th className="text-right p-3 font-medium">Rescued</th>
                <th className="text-right p-3 font-medium">Latency</th>
                <th className="text-right p-3 font-medium">Success Rate</th>
                <th className="text-right p-3 font-medium">Rescues</th>
                <th className="text-right p-3 font-medium">Volume</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e1e]">
              {performanceData.slice().reverse().map((day, i) => (
                <tr key={i} className="hover:bg-[#1E2532]/30 transition-colors">
                  <td className="p-3 text-white font-medium">{day.date}</td>
                  <td className="p-3 text-right text-[#00D98F] font-mono">
                    {formatCurrency(day.rescued)}
                  </td>
                  <td className="p-3 text-right text-[#00A3FF] font-mono">
                    {day.latency}ms
                  </td>
                  <td className="p-3 text-right text-[#00D98F] font-mono">
                    {day.successRate.toFixed(1)}%
                  </td>
                  <td className="p-3 text-right text-white font-mono">{day.rescues}</td>
                  <td className="p-3 text-right text-[#8A93A3] font-mono">
                    {formatCurrency(day.volume)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}