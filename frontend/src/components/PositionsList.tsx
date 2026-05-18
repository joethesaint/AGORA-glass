'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { StatusBadge } from './StatusBadge';
import {
  Plus,
  Minus,
  X,
  TrendingUp,
  AlertTriangle,
  Eye,
  MoreVertical,
} from 'lucide-react';

export interface Position {
  id: string;
  symbol: string;
  entryPrice: number;
  currentPrice: number;
  size: number;
  marginRatio: number;
  leverage: number;
  collateral: number;
  unrealizedPnL: number;
}

interface PositionCardEnhancedProps {
  position: Position;
  onClose?: (id: string) => void;
  onAddMargin?: (id: string) => void;
  onDeleverage?: (id: string) => void;
}

export const PositionCardEnhanced = memo<PositionCardEnhancedProps>(
  ({ position, onClose, onAddMargin, onDeleverage }) => {
    const getStatusType = (leverage: number): 'safe' | 'warning' | 'critical' => {
      if (leverage > 5) return 'critical';
      if (leverage > 3) return 'warning';
      return 'safe';
    };

    const status = getStatusType(position.leverage);
    const priceChange = position.currentPrice - position.entryPrice;
    const priceChangePercent = (priceChange / position.entryPrice) * 100;
    const isUnderwater = position.unrealizedPnL < 0;
    const liquidationPrice = position.entryPrice - (position.collateral / position.size);

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="agora-card p-5 space-y-6"
      >
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h4 className="text-lg font-bold text-white tracking-tight">{position.symbol}</h4>
              <StatusBadge status={status} text={status} />
            </div>
            <p className="text-[10px] text-[#484848] font-mono tracking-widest uppercase">ID: {position.id.slice(0, 8)}</p>
          </div>
          <button
            onClick={() => onClose?.(position.id)}
            className="p-1.5 hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/10"
          >
            <MoreVertical className="w-4 h-4 text-[#8A93A3]" />
          </button>
        </div>

        {/* Price Info Grid */}
        <div className="grid grid-cols-3 gap-4 py-4 border-y border-white/5">
          <div>
            <p className="text-[9px] text-[#8A93A3] font-bold uppercase tracking-widest mb-1.5">Entry Price</p>
            <p className="text-xs font-mono text-white">${position.entryPrice.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[9px] text-[#8A93A3] font-bold uppercase tracking-widest mb-1.5">Current</p>
            <motion.p
              key={position.currentPrice}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              className={`text-xs font-mono font-bold ${priceChange >= 0 ? 'text-[#00D98F]' : 'text-[#FF3B3B]'}`}
            >
              ${position.currentPrice.toLocaleString()}
            </motion.p>
          </div>
          <div>
            <p className="text-[9px] text-[#8A93A3] font-bold uppercase tracking-widest mb-1.5">PnL %</p>
            <p
              className={`text-xs font-mono font-bold ${priceChange >= 0 ? 'text-[#00D98F]' : 'text-[#FF3B3B]'}`}
            >
              {priceChange >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%
            </p>
          </div>
        </div>

        {/* Core Risk Metrics */}
        <div className="grid grid-cols-2 gap-6 bg-white/5 p-4 rounded-xl border border-white/5">
          <div className="space-y-1">
            <p className="text-[9px] text-[#8A93A3] font-bold uppercase tracking-widest">Margin Ratio</p>
            <motion.p
              key={position.marginRatio}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              className={`text-2xl font-bold font-mono ${position.marginRatio >= 0.12 ? 'text-[#00D98F]' : 'text-[#FF3B3B]'}`}
            >
              {(position.marginRatio * 100).toFixed(1)}%
            </motion.p>
          </div>
          <div className="space-y-1">
            <p className="text-[9px] text-[#8A93A3] font-bold uppercase tracking-widest">Leverage</p>
            <motion.p
              key={position.leverage}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              className={`text-2xl font-bold font-mono ${position.leverage <= 5 ? 'text-[#00A3FF]' : 'text-[#FF3B3B]'}`}
            >
              {position.leverage.toFixed(1)}x
            </motion.p>
          </div>
        </div>

        {/* PnL and Liquidation Section */}
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <span className="text-[9px] text-[#8A93A3] font-bold uppercase tracking-widest">Unrealized PnL</span>
            <motion.p
              key={position.unrealizedPnL}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              className={`text-sm font-mono font-bold ${isUnderwater ? 'text-[#FF3B3B]' : 'text-[#00D98F]'}`}
            >
              {isUnderwater ? '' : '+'}${position.unrealizedPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </motion.p>
          </div>
          
          {position.marginRatio < 0.15 && (
            <div className="p-3 rounded-lg bg-[#FF3B3B]/10 border border-[#FF3B3B]/20 flex gap-3 items-center">
              <AlertTriangle className="w-4 h-4 text-[#FF3B3B] flex-shrink-0" />
              <div className="flex-1">
                <p className="text-[9px] text-[#FF3B3B] font-bold uppercase tracking-widest">Critical Liquidation Risk</p>
                <p className="text-[10px] text-[#FF3B3B]/80 font-mono">Price Target: ${liquidationPrice.toLocaleString()}</p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          <motion.button
            whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onAddMargin?.(position.id)}
            className="py-2.5 rounded-lg bg-white/5 border border-white/5 flex flex-col items-center justify-center gap-1.5 transition-colors"
          >
            <Plus className="w-3 h-3 text-[#8A93A3]" />
            <span className="text-[8px] font-bold text-white uppercase tracking-tighter">Add Margin</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onDeleverage?.(position.id)}
            className="py-2.5 rounded-lg bg-white/5 border border-white/5 flex flex-col items-center justify-center gap-1.5 transition-colors"
          >
            <Minus className="w-3 h-3 text-[#8A93A3]" />
            <span className="text-[8px] font-bold text-white uppercase tracking-tighter">Deleverage</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 59, 59, 0.15)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onClose?.(position.id)}
            className="py-2.5 rounded-lg bg-[#FF3B3B]/10 border border-[#FF3B3B]/10 flex flex-col items-center justify-center gap-1.5 transition-colors"
          >
            <X className="w-3 h-3 text-[#FF3B3B]" />
            <span className="text-[8px] font-bold text-[#FF3B3B] uppercase tracking-tighter">Close Pos</span>
          </motion.button>
        </div>
      </motion.div>
    );
  }
);

PositionCardEnhanced.displayName = 'PositionCardEnhanced';

interface PositionsListProps {
  positions: Position[];
  onPositionClose?: (id: string) => void;
  onAddMargin?: (id: string) => void;
  onDeleverage?: (id: string) => void;
}

export const PositionsList = memo<PositionsListProps>(
  ({ positions, onPositionClose, onAddMargin, onDeleverage }) => {
    const criticalCount = positions.filter((p) => p.leverage > 5).length;
    const warningCount = positions.filter((p) => p.leverage > 3 && p.leverage <= 5).length;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Summary Stats */}
        <div className="agora-card p-4 flex gap-6 items-center">
          <div>
            <p className="text-[10px] text-[#787878] uppercase tracking-widest">Total Positions</p>
            <p className="text-2xl font-bold text-[#00A3FF]">{positions.length}</p>
          </div>
          {criticalCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-[#FF3B3B]/10 border border-[#FF3B3B]/20 rounded">
              <AlertTriangle className="w-4 h-4 text-[#FF3B3B]" />
              <span className="text-[10px] text-[#FF3B3B] font-mono uppercase tracking-widest">
                {criticalCount} CRITICAL
              </span>
            </div>
          )}
          {warningCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-[#F5A623]/10 border border-[#F5A623]/20 rounded">
              <TrendingUp className="w-4 h-4 text-[#F5A623]" />
              <span className="text-[10px] text-[#F5A623] font-mono uppercase tracking-widest">
                {warningCount} WARNING
              </span>
            </div>
          )}
        </div>

        {/* Positions Grid */}
        {positions.length === 0 ? (
          <div className="agora-card p-12 text-center">
            <Eye className="w-8 h-8 text-[#787878] mx-auto mb-3 opacity-50" />
            <p className="text-[10px] text-[#787878] uppercase tracking-widest">No positions currently open</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {positions.map((position) => (
              <PositionCardEnhanced
                key={position.id}
                position={position}
                onClose={onPositionClose}
                onAddMargin={onAddMargin}
                onDeleverage={onDeleverage}
              />
            ))}
          </div>
        )}
      </motion.div>
    );
  }
);

PositionsList.displayName = 'PositionsList';
