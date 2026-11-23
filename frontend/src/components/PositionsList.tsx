'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { StatusBadge } from './StatusBadge';
import { Position } from '@/types/position';
import { useWalletStore } from '@/stores/walletStore';
import {
  Plus,
  Minus,
  X,
  TrendingUp,
  AlertTriangle,
  Eye,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  Lock,
} from 'lucide-react';

interface PositionCardEnhancedProps {
  position: Position;
  onClose?: (id: string) => void;
  onAddMargin?: (id: string) => void;
  onDeleverage?: (id: string) => void;
  onClick?: (id: string) => void;
}

export const PositionCardEnhanced = memo<PositionCardEnhancedProps>(
  ({ position, onClose, onAddMargin, onDeleverage, onClick }) => {
    const { isConnected, setIsModalOpen } = useWalletStore();

    const handleGatedAction = (e: React.MouseEvent, action?: (id: string) => void) => {
      e.stopPropagation();
      if (!isConnected) {
        setIsModalOpen(true);
      } else {
        action?.(position.id);
      }
    };

    const getStatusType = (leverage: number): 'safe' | 'warning' | 'critical' => {
      if (leverage > 5) return 'critical';
      if (leverage > 3) return 'warning';
      return 'safe';
    };

    const status = getStatusType(position.leverage);
    const priceChange = position.currentPrice - position.entryPrice;
    const priceChangePercent = (priceChange / position.entryPrice) * 100;
    const isUnderwater = position.unrealizedPnL < 0;
    const side = position.side || 'LONG';
    const liquidationPrice = position.liquidationPrice || (position.entryPrice - (position.collateral / position.size));

    return (
      <div
        onClick={() => onClick?.(position.id)}
        className="agora-card p-5 space-y-6 cursor-pointer hover:border-accent/50 transition-colors group animate-in fade-in slide-in-from-bottom-2 duration-300"
      >
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-2">
                <h4 className="text-lg font-bold text-white tracking-tight">{position.symbol}</h4>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${side === 'LONG' ? 'bg-pos/10 text-pos' : 'bg-neg/10 text-neg'}`}>
                  {side}
                </span>
              </div>
              <StatusBadge status={status} text={status} />
            </div>
            <p className="text-[10px] text-[#484848] font-mono tracking-widest uppercase">ID: {position.id.slice(0, 8)}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose?.(position.id);
            }}
            className="p-1.5 hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/10"
          >
            <MoreVertical className="w-4 h-4 text-muted" />
          </button>
        </div>

        {/* Price Info Grid */}
        <div className="grid grid-cols-3 gap-4 py-4 border-y border-white/5">
          <div>
            <p className="text-[9px] text-muted font-bold uppercase tracking-widest mb-1.5">Entry Price</p>
            <p className="text-xs font-mono text-white">${position.entryPrice.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[9px] text-muted font-bold uppercase tracking-widest mb-1.5">Current</p>
            <p className={`text-xs font-mono font-bold ${priceChange >= 0 ? 'text-pos' : 'text-neg'}`}>
              ${position.currentPrice.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-[9px] text-muted font-bold uppercase tracking-widest mb-1.5">PnL %</p>
            <div className="flex items-center gap-1">
              <p className={`text-xs font-mono font-bold ${priceChange >= 0 ? 'text-pos' : 'text-neg'}`}>
                {priceChange >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%
              </p>
              {priceChange >= 0 ? (
                <ArrowUpRight className="w-3 h-3 text-pos" />
              ) : (
                <ArrowDownRight className="w-3 h-3 text-neg" />
              )}
            </div>
          </div>
        </div>

        {/* Core Risk Metrics */}
        <div className="grid grid-cols-2 gap-6 bg-white/5 p-4 rounded-xl border border-white/5">
            <div className="space-y-2">
              <p className="text-[9px] text-muted font-bold uppercase tracking-widest text-glow">Margin Ratio</p>
              <p className={`text-2xl font-bold font-mono ${position.marginRatio >= 0.12 ? 'text-pos' : 'text-neg'}`}>
                {(position.marginRatio * 100).toFixed(1)}%
              </p>
              {/* Safety Band Bar */}
              <div className="w-full bg-gray-700/30 h-2 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${position.marginRatio * 100}%`,
                    background: position.marginRatio >= 0.12 ? 'hsl(150, 100%, 45%)' : 'hsl(0, 80%, 55%)',
                  }}
                />
              </div>
            </div>
          <div className="space-y-1">
            <p className="text-[9px] text-muted font-bold uppercase tracking-widest">Leverage</p>
            <p className={`text-2xl font-bold font-mono ${position.leverage <= 5 ? 'text-accent' : 'text-neg'}`}>
              {position.leverage.toFixed(1)}x
            </p>
          </div>
        </div>

        {/* PnL and Liquidation Section */}
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <span className="text-[9px] text-muted font-bold uppercase tracking-widest">Unrealized PnL</span>
            <p className={`text-sm font-mono font-bold ${isUnderwater ? 'text-neg' : 'text-pos'}`}>
              {isUnderwater ? '' : '+'}${position.unrealizedPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          
          {position.marginRatio < 0.15 && (
            <div className="p-3 rounded-lg bg-neg/10 border border-neg/20 flex gap-3 items-center">
              <AlertTriangle className="w-4 h-4 text-neg flex-shrink-0" />
              <div className="flex-1">
                <p className="text-[9px] text-neg font-bold uppercase tracking-widest">Critical Liquidation Risk</p>
                <p className="text-[10px] text-neg/80 font-mono">Price Target: ${liquidationPrice.toLocaleString()}</p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          <button
            onClick={(e) => handleGatedAction(e, onAddMargin)}
            className="py-2.5 rounded-lg bg-white/5 border border-white/5 flex flex-col items-center justify-center gap-1.5 transition-all duration-200 hover:scale-[1.02] hover:bg-white/10 active:scale-[0.98] relative group/btn"
          >
            {!isConnected && <Lock className="w-2 h-2 absolute top-1.5 right-1.5 text-[#484848] group-hover/btn:text-muted" />}
            <Plus className="w-3 h-3 text-muted" />
            <span className="text-[8px] font-bold text-white uppercase tracking-tighter">Add Margin</span>
          </button>
          <button
            onClick={(e) => handleGatedAction(e, onDeleverage)}
            className="py-2.5 rounded-lg bg-white/5 border border-white/5 flex flex-col items-center justify-center gap-1.5 transition-all duration-200 hover:scale-[1.02] hover:bg-white/10 active:scale-[0.98] relative group/btn"
          >
            {!isConnected && <Lock className="w-2 h-2 absolute top-1.5 right-1.5 text-[#484848] group-hover/btn:text-muted" />}
            <Minus className="w-3 h-3 text-muted" />
            <span className="text-[8px] font-bold text-white uppercase tracking-tighter">Deleverage</span>
          </button>
          <button
            onClick={(e) => handleGatedAction(e, onClose)}
            className="py-2.5 rounded-lg bg-neg/10 border border-neg/10 flex flex-col items-center justify-center gap-1.5 transition-all duration-200 hover:scale-[1.02] hover:bg-neg/20 active:scale-[0.98] relative group/btn"
          >
            {!isConnected && <Lock className="w-2 h-2 absolute top-1.5 right-1.5 text-neg/40 group-hover/btn:text-neg" />}
            <X className="w-3 h-3 text-neg" />
            <span className="text-[8px] font-bold text-neg uppercase tracking-tighter">Close Pos</span>
          </button>
        </div>
      </div>
    );
  }
);

PositionCardEnhanced.displayName = 'PositionCardEnhanced';

interface PositionsListProps {
  positions: Position[];
  onPositionClose?: (id: string) => void;
  onAddMargin?: (id: string) => void;
  onDeleverage?: (id: string) => void;
  onPositionClick?: (id: string) => void;
}

export const PositionsList = memo<PositionsListProps>(
  ({ positions, onPositionClose, onAddMargin, onDeleverage, onPositionClick }) => {
    const criticalCount = positions.filter((p) => p.leverage > 5).length;
    const warningCount = positions.filter((p) => p.leverage > 3 && p.leverage <= 5).length;

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
        {/* Summary Stats */}
        <div className="agora-card p-4 flex gap-6 items-center">
          <div>
            <p className="text-[10px] text-[#787878] uppercase tracking-widest text-glow">Total Positions</p>
            <p className="text-2xl font-bold" style={{color: 'hsl(210, 100%, 70%)'}}>{positions.length}</p>
          </div>
          {criticalCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-2" style={{background: 'hsla(0, 80%, 55%, 0.1)', border: '1px solid hsla(0, 80%, 55%, 0.2)', borderRadius: '0.5rem'}}>
              <AlertTriangle className="w-4 h-4" style={{color: 'hsl(0, 80%, 55%)'}} />
              <span className="text-[10px] font-mono uppercase" style={{color: 'hsl(0, 80%, 55%)'}}>{criticalCount} CRITICAL</span>
            </div>
          )}
          {warningCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-2" style={{background: 'hsla(30, 100%, 55%, 0.1)', border: '1px solid hsla(30, 100%, 55%, 0.2)', borderRadius: '0.5rem'}}>
              <TrendingUp className="w-4 h-4" style={{color: 'hsl(30, 100%, 55%)'}} />
              <span className="text-[10px] font-mono uppercase" style={{color: 'hsl(30, 100%, 55%)'}}>{warningCount} WARNING</span>
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
                onClick={onPositionClick}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
);

PositionsList.displayName = 'PositionsList';
