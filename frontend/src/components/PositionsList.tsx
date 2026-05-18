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
        className="agora-card p-5 space-y-4"
      >
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h4 className="text-lg font-bold text-white">{position.symbol}</h4>
              <StatusBadge status={status} text={status} />
            </div>
            <p className="text-[10px] text-[#787878]">ID: {position.id.slice(0, 8)}</p>
          </div>
          <button
            onClick={() => onClose?.(position.id)}
            className="p-2 hover:bg-[#1e1e1e] rounded transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-[#787878]" />
          </button>
        </div>

        {/* Price Info */}
        <div className="grid grid-cols-3 gap-3 py-3 border-t border-b border-[#1e1e1e]">
          <div>
            <p className="text-[10px] text-[#787878] uppercase tracking-widest">Entry</p>
            <p className="text-sm font-mono">${position.entryPrice.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[10px] text-[#787878] uppercase tracking-widest">Current</p>
            <motion.p
              key={position.currentPrice}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              className={`text-sm font-mono ${priceChange >= 0 ? 'text-[#00D98F]' : 'text-[#FF3B3B]'}`}
            >
              ${position.currentPrice.toLocaleString()}
            </motion.p>
          </div>
          <div>
            <p className="text-[10px] text-[#787878] uppercase tracking-widest">Change</p>
            <p
              className={`text-sm font-mono font-semibold ${priceChange >= 0 ? 'text-[#00D98F]' : 'text-[#FF3B3B]'}`}
            >
              {priceChange >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%
            </p>
          </div>
        </div>

        {/* Risk Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] text-[#787878] uppercase tracking-widest">Margin Ratio</p>
            <motion.p
              key={position.marginRatio}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              className={`text-lg font-bold ${position.marginRatio >= 0.12 ? 'text-[#00D98F]' : 'text-[#FF3B3B]'}`}
            >
              {(position.marginRatio * 100).toFixed(1)}%
            </motion.p>
            {position.marginRatio < 0.12 && (
              <p className="text-[9px] text-[#FF3B3B] mt-1">⚠️ Below 12%</p>
            )}
          </div>
          <div>
            <p className="text-[10px] text-[#787878] uppercase tracking-widest">Leverage</p>
            <motion.p
              key={position.leverage}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              className={`text-lg font-bold ${position.leverage <= 5 ? 'text-[#00A3FF]' : 'text-[#FF3B3B]'}`}
            >
              {position.leverage.toFixed(1)}x
            </motion.p>
          </div>
        </div>

        {/* PnL */}
        <div className="p-3 rounded bg-[#0B0E14] border border-[#1e1e1e]">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-[#787878] uppercase tracking-widest">Unrealized PnL</span>
            <motion.p
              key={position.unrealizedPnL}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              className={`text-sm font-mono font-semibold ${isUnderwater ? 'text-[#FF3B3B]' : 'text-[#00D98F]'}`}
            >
              {isUnderwater ? '' : '+'}${position.unrealizedPnL.toFixed(2)}
            </motion.p>
          </div>
        </div>

        {/* Liquidation Warning */}
        {position.marginRatio < 0.15 && (
          <div className="p-3 rounded bg-[#FF3B3B]/10 border border-[#FF3B3B]/20 flex gap-2">
            <AlertTriangle className="w-4 h-4 text-[#FF3B3B] flex-shrink-0 mt-0.5" />
            <div className="text-[10px] text-[#FF3B3B]">
              <p className="font-semibold mb-1">Liquidation Risk</p>
              <p>Price: ${liquidationPrice.toLocaleString()}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAddMargin?.(position.id)}
            className="p-2 rounded border border-[#1e1e1e] hover:bg-[#1e1e1e] transition-colors flex items-center justify-center gap-2 text-[10px] font-mono uppercase tracking-widest"
          >
            <Plus className="w-3 h-3" />
            Margin
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDeleverage?.(position.id)}
            className="p-2 rounded border border-[#1e1e1e] hover:bg-[#1e1e1e] transition-colors flex items-center justify-center gap-2 text-[10px] font-mono uppercase tracking-widest"
          >
            <Minus className="w-3 h-3" />
            Reduce
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onClose?.(position.id)}
            className="p-2 rounded border border-[#FF3B3B]/20 hover:bg-[#FF3B3B]/10 transition-colors flex items-center justify-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#FF3B3B]"
          >
            <X className="w-3 h-3" />
            Close
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
