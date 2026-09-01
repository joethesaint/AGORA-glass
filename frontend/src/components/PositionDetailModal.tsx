'use client';

import { useEffect, useMemo, useState } from 'react';
import { useWalletStore } from '@/stores/walletStore';
import { X, TrendingUp, TrendingDown, Clock, AlertTriangle, Plus, Minus, RefreshCw, BarChart3, History, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Position } from '@/types/position';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  AreaChart,
} from 'recharts';
import { useContainerWidth } from '@/hooks/useContainerWidth';

interface PositionDetailModalProps {
  position: Position | null;
  isOpen: boolean;
  onClose: () => void;
  onAddMargin: (id: string, amount: number) => void;
  onDeleverage: (id: string, amount: number) => void;
  onClosePosition: (id: string) => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatPercent = (value: number) => `${(value * 100).toFixed(2)}%`;

const formatTime = (timestamp: number) => {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(timestamp));
};

const getRiskLevel = (marginRatio: number) => {
  if (marginRatio < 0.1) return { level: 'Critical', color: 'var(--color-neg)', icon: AlertTriangle };
  if (marginRatio < 0.2) return { level: 'Warning', color: '#FF6B35', icon: AlertTriangle };
  if (marginRatio < 0.3) return { level: 'Monitor', color: '#FFB800', icon: Clock };
  return { level: 'Healthy', color: 'var(--color-pos)', icon: TrendingUp };
};

export const PositionDetailModal = ({
  position,
  isOpen,
  onClose,
  onAddMargin,
  onDeleverage,
  onClosePosition,
}: PositionDetailModalProps) => {
  const { isConnected, setIsModalOpen } = useWalletStore();
  const { ref: historyChartRef, width: historyChartWidth } = useContainerWidth<HTMLDivElement>();
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'actions'>('overview');
  const [marginAmount, setMarginAmount] = useState('');
  const [deleverageAmount, setDeleverageAmount] = useState('');

  const handleGatedAction = (action: () => void) => {
    if (!isConnected) {
      setIsModalOpen(true);
    } else {
      action();
    }
  };

  const riskInfo = useMemo(() => {
    if (!position) return getRiskLevel(1);
    return getRiskLevel(position.marginRatio);
  }, [position]);

  const mockHistory = useMemo(() => {
    if (!position) return [];
    // Generate mock history if not provided
    const now = Date.now();
    return Array.from({ length: 24 }, (_, i) => {
      const timestamp = now - (23 - i) * 3600000;
      const priceVariation = (Math.random() - 0.5) * 0.02;
      const price = position.entryPrice * (1 + priceVariation);
      const marginVariation = (Math.random() - 0.5) * 0.1;
      const margin = Math.max(0.05, position.marginRatio + marginVariation);
      const leverageVariation = (Math.random() - 0.5) * 1;
      const leverage = Math.max(1, position.leverage + leverageVariation);
      return { timestamp, price, margin, leverage };
    });
  }, [position]);

  const pnlPercentage = position
    ? ((position.currentPrice - position.entryPrice) / position.entryPrice) * 100 * position.leverage
    : 0;

  const handleAddMargin = () => {
    if (!position || !marginAmount) return;
    onAddMargin(position.id, parseFloat(marginAmount));
    setMarginAmount('');
  };

  const handleDeleverage = () => {
    if (!position || !deleverageAmount) return;
    onDeleverage(position.id, parseFloat(deleverageAmount));
    setDeleverageAmount('');
  };

  const handleForceClose = () => {
    if (!position) return;
    if (confirm(`Are you sure you want to close ${position.symbol}?`)) {
      onClosePosition(position.id);
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!position) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-4 lg:inset-10 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className="bg-[#0B0E14] border border-[#1E2532] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col pointer-events-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-[#1E2532]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#1E2532] flex items-center justify-center">
                    <span className="text-xl font-bold text-accent">
                      {position.symbol.split('-')[0].slice(0, 3)}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold text-white">{position.symbol}</h2>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${position.side === 'LONG' ? 'bg-pos/10 text-pos' : 'bg-neg/10 text-neg'}`}>
                        {position.side || 'LONG'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-mono`}
                        style={{
                          backgroundColor: `${riskInfo.color}15`,
                          color: riskInfo.color,
                        }}
                      >
                        {riskInfo.level}
                      </span>
                      <span className="text-xs text-muted">
                        {position.leverage.toFixed(1)}x Leverage
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-[#1E2532] rounded-lg transition-colors"
                >
                  <X size={20} className="text-muted" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-[#1E2532] px-6">
                {[
                  { id: 'overview', label: 'Overview', icon: BarChart3 },
                  { id: 'history', label: 'History', icon: History },
                  { id: 'actions', label: 'Actions', icon: RefreshCw },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-accent text-accent'
                        : 'border-transparent text-muted hover:text-white'
                    }`}
                  >
                    <tab.icon size={14} />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-4">
                        <p className="text-xs text-muted mb-1">Current Price</p>
                        <p className="text-lg font-bold text-white font-mono">
                          {formatCurrency(position.currentPrice)}
                        </p>
                      </div>
                      <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-4">
                        <p className="text-xs text-muted mb-1">Entry Price</p>
                        <p className="text-lg font-bold text-white font-mono">
                          {formatCurrency(position.entryPrice)}
                        </p>
                      </div>
                      <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-4">
                        <p className="text-xs text-muted mb-1">P&L</p>
                        <p
                          className={`text-lg font-bold font-mono ${
                            position.unrealizedPnL >= 0 ? 'text-pos' : 'text-neg'
                          }`}
                        >
                          {position.unrealizedPnL >= 0 ? '+' : ''}
                          {formatCurrency(position.unrealizedPnL)}
                        </p>
                        <p
                          className={`text-xs font-mono ${
                            pnlPercentage >= 0 ? 'text-pos' : 'text-neg'
                          }`}
                        >
                          {pnlPercentage >= 0 ? '+' : ''}
                          {pnlPercentage.toFixed(2)}%
                        </p>
                      </div>
                      <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-4">
                        <p className="text-xs text-muted mb-1">Margin Ratio</p>
                        <p
                          className={`text-lg font-bold font-mono ${
                            riskInfo.color === 'var(--color-neg)'
                              ? 'text-neg'
                              : riskInfo.color === '#FF6B35'
                              ? 'text-[#FF6B35]'
                              : 'text-white'
                          }`}
                        >
                          {formatPercent(position.marginRatio)}
                        </p>
                      </div>
                    </div>

                    {/* Secondary Metrics */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-4">
                        <p className="text-xs text-muted mb-1">Position Size</p>
                        <p className="text-lg font-bold text-white font-mono">
                          {position.size} {position.symbol.split('-')[0]}
                        </p>
                      </div>
                      <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-4">
                        <p className="text-xs text-muted mb-1">Collateral</p>
                        <p className="text-lg font-bold text-white font-mono">
                          {formatCurrency(position.collateral)}
                        </p>
                      </div>
                      <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-4">
                        <p className="text-xs text-muted mb-1">Position Value</p>
                        <p className="text-lg font-bold text-white font-mono">
                          {formatCurrency(position.size * position.currentPrice)}
                        </p>
                      </div>
                      <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-4">
                        <p className="text-xs text-muted mb-1">Liq. Price (Est.)</p>
                        <p className="text-lg font-bold text-[#FF6B35] font-mono">
                          {formatCurrency(position.entryPrice * 0.85)}
                        </p>
                      </div>
                    </div>

                    {/* Price Chart */}
                    <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-4">
                      <h3 className="text-sm font-semibold text-white mb-4">Price History (24h)</h3>
                      <div ref={historyChartRef} className="h-48">
                        <AreaChart width={historyChartWidth} height={192} data={mockHistory}>
                          <defs>
                            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop
                                offset="5%"
                                stopColor="var(--color-accent)"
                                stopOpacity={0.3}
                              />
                              <stop
                                offset="95%"
                                stopColor="var(--color-accent)"
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
                          <XAxis
                            dataKey="timestamp"
                            tickFormatter={(t) => formatTime(t)}
                            stroke="#484848"
                            fontSize={10}
                          />
                          <YAxis
                            domain={['dataMin - 100', 'dataMax + 100']}
                            stroke="#484848"
                            fontSize={10}
                            tickFormatter={(v) => `$${v.toLocaleString()}`}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#111111',
                              border: '1px solid #1e1e1e',
                              borderRadius: '8px',
                            }}
                            labelFormatter={(t) => formatTime(t as number)}
                            formatter={(value: any) => [
                              formatCurrency(Number(value)),
                              'Price',
                            ]}
                          />
                          <Area
                            type="monotone"
                            dataKey="price"
                            stroke="var(--color-accent)"
                            fill="url(#priceGradient)"
                            strokeWidth={2}
                            isAnimationActive={false}
                          />
                        </AreaChart>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'history' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-white mb-4">Position History</h3>
                    <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-[#0a0907] text-muted">
                          <tr>
                            <th className="text-left p-3 font-medium">Time</th>
                            <th className="text-left p-3 font-medium">Price</th>
                            <th className="text-left p-3 font-medium">Margin</th>
                            <th className="text-left p-3 font-medium">Leverage</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1e1e1e]">
                          {mockHistory.slice().reverse().map((h, i) => (
                            <tr key={i} className="hover:bg-[#1E2532]/50">
                              <td className="p-3 text-white font-mono">{formatTime(h.timestamp)}</td>
                              <td className="p-3 text-white font-mono">{formatCurrency(h.price)}</td>
                              <td className="p-3 text-white font-mono">{formatPercent(h.margin)}</td>
                              <td className="p-3 text-white font-mono">{h.leverage.toFixed(2)}x</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === 'actions' && (
                  <div className="space-y-6">
                    {/* Add Margin */}
                    <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Plus size={18} className="text-pos" />
                        <h3 className="text-sm font-semibold text-white">Add Margin</h3>
                      </div>
                      <div className="flex gap-3">
                        <input
                          type="number"
                          value={marginAmount}
                          onChange={(e) => setMarginAmount(e.target.value)}
                          placeholder="Amount in USDC"
                          className="flex-1 px-4 py-2 bg-[#0a0907] border border-[#1e1e1e] rounded-lg text-white text-sm font-mono placeholder-[#484848] focus:outline-none focus:border-accent"
                        />
                        <button
                          onClick={() => handleGatedAction(handleAddMargin)}
                          className="px-6 py-2 bg-pos text-white rounded-lg hover:bg-[#00C77E] transition-colors font-medium flex items-center gap-2"
                        >
                          {!isConnected && <Lock size={12} />}
                          Add
                        </button>
                      </div>
                      <div className="flex gap-2 mt-3">
                        {[100, 500, 1000, 5000].map((amt) => (
                          <button
                            key={amt}
                            onClick={() => setMarginAmount(amt.toString())}
                            className="px-3 py-1 text-xs bg-[#0a0907] border border-[#1e1e1e] rounded text-muted hover:border-accent hover:text-white transition-colors"
                          >
                            +${amt}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Deleverage */}
                    <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Minus size={18} className="text-[#FF6B35]" />
                        <h3 className="text-sm font-semibold text-white">Reduce Leverage</h3>
                      </div>
                      <div className="flex gap-3">
                        <input
                          type="number"
                          value={deleverageAmount}
                          onChange={(e) => setDeleverageAmount(e.target.value)}
                          placeholder="Reduce by % (e.g., 20)"
                          className="flex-1 px-4 py-2 bg-[#0a0907] border border-[#1e1e1e] rounded-lg text-white text-sm font-mono placeholder-[#484848] focus:outline-none focus:border-accent"
                        />
                        <button
                          onClick={() => handleGatedAction(handleDeleverage)}
                          className="px-6 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#E85A24] transition-colors font-medium flex items-center gap-2"
                        >
                          {!isConnected && <Lock size={12} />}
                          Reduce
                        </button>
                      </div>
                      <div className="flex gap-2 mt-3">
                        {[10, 25, 50, 75].map((pct) => (
                          <button
                            key={pct}
                            onClick={() => setDeleverageAmount(pct.toString())}
                            className="px-3 py-1 text-xs bg-[#0a0907] border border-[#1e1e1e] rounded text-muted hover:border-accent hover:text-white transition-colors"
                          >
                            -{pct}%
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Force Close */}
                    <div className="bg-neg/5 border border-neg/20 rounded-xl p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-neg">Close Position</h3>
                          <p className="text-xs text-muted mt-1">
                            This will close the entire position at current market price
                          </p>
                        </div>
                        <button
                          onClick={() => handleGatedAction(handleForceClose)}
                          className="px-6 py-2 bg-neg text-white rounded-lg hover:bg-[#E82A2A] transition-colors font-medium flex items-center gap-2"
                        >
                          {!isConnected && <Lock size={12} />}
                          Close Position
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};