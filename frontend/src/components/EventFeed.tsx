'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle,
  Activity,
  Shield,
  Zap,
  TrendingUp,
  Clock,
  BarChart3,
  Play,
} from 'lucide-react';
import { EventType } from '@/types/agent';

export interface Event {
  type: EventType;
  event_type?: string;
  timestamp: number;
  data: Record<string, any>;
  payload?: any;
}

const EVENT_ICONS: Record<string, React.ReactNode> = {
  PositionUpdate: <Activity className="w-4 h-4" />,
  RiskVerdict: <AlertCircle className="w-4 h-4" />,
  ReasoningTrace: <Shield className="w-4 h-4" />,
  RescueInitiated: <Play className="w-4 h-4" />,
  RescueComplete: <Zap className="w-4 h-4" />,
  ANALYTICS_UPDATE: <BarChart3 className="w-4 h-4" />,
  Unknown: <Clock className="w-4 h-4" />,
};

const EVENT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  PositionUpdate: { bg: 'bg-accent/10', text: 'text-accent', border: 'border-accent/20' },
  RiskVerdict: { bg: 'bg-warn/10', text: 'text-warn', border: 'border-warn/20' },
  ReasoningTrace: { bg: 'bg-[#d4ff3e]/10', text: 'text-[#d4ff3e]', border: 'border-[#d4ff3e]/20' },
  RescueInitiated: { bg: 'bg-accent/10', text: 'text-accent', border: 'border-accent/20' },
  RescueComplete: { bg: 'bg-pos/10', text: 'text-pos', border: 'border-pos/20' },
  ANALYTICS_UPDATE: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20' },
  Unknown: { bg: 'bg-[#787878]/10', text: 'text-[#787878]', border: 'border-[#787878]/20' },
};

interface EventTypeIconProps {
  type: string;
}

export const EventTypeIcon = memo<EventTypeIconProps>(({ type }) => {
  const colors = EVENT_COLORS[type] || EVENT_COLORS.Unknown;
  const icon = EVENT_ICONS[type] || EVENT_ICONS.Unknown;
  return (
    <div className={`p-2 rounded border ${colors.bg} ${colors.text} ${colors.border}`}>
      {icon}
    </div>
  );
});

EventTypeIcon.displayName = 'EventTypeIcon';

interface EventFeedProps {
  events: any[]; // Accept AgentSignal or Event
  maxItems?: number;
}

export const EventFeed = memo<EventFeedProps>(({ events, maxItems = 10 }) => {
  const displayEvents = events.slice(0, maxItems);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="agora-card h-full flex flex-col min-h-[500px]"
    >
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">System Intelligence</h3>
          <p className="text-[10px] text-muted font-bold uppercase tracking-widest">Real-time Sentinel Signals</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 border border-white/10">
          <div className="w-1.5 h-1.5 bg-pos rounded-full animate-pulse" />
          <span className="text-[9px] text-white font-mono uppercase">Streaming</span>
        </div>
      </div>

      <div className="space-y-4 overflow-y-auto flex-1 custom-scrollbar pr-2 -mr-2">
        {displayEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#484848] space-y-4">
            <Activity className="w-8 h-8 opacity-20" />
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold">Awaiting initialization...</p>
          </div>
        ) : (
          displayEvents.map((event, idx) => {
            const type = event.event_type || event.type;
            const colors = EVENT_COLORS[type] || EVENT_COLORS.Unknown;
            const data = event.payload || event.data;
            const time = new Date(event.timestamp * 1000).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false
            });

            return (
              <div
                key={`${event.timestamp}-${event.event_type || event.type}-${JSON.stringify(event.payload || {}).length}`}
                className={`group flex gap-4 p-4 min-h-[100px] rounded-xl border ${colors.bg} ${colors.border} hover:bg-white/[0.04] transition-all duration-300 relative overflow-hidden animate-in fade-in slide-in-from-left-2`}
                style={{ animationFillMode: 'both' }}
              >
                {/* Visual Accent */}
                <div className={`absolute left-0 top-0 bottom-0 w-0.5 opacity-40 ${colors.text.replace('text-', 'bg-')}`} />
                
                <div className="flex-shrink-0 mt-0.5">
                  <div className={`p-2 rounded-lg bg-white/5 border border-white/5 group-hover:scale-110 transition-transform ${colors.text}`}>
                    {EVENT_ICONS[type] || EVENT_ICONS.Unknown}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className={`text-[10px] font-bold ${colors.text} uppercase tracking-widest`}>
                      {type}
                    </span>
                    <span className="text-[10px] text-[#484848] font-mono group-hover:text-muted transition-colors">{time}</span>
                  </div>

                  <div className="text-[11px] text-white/70 leading-relaxed font-mono">
                    {type === 'ReasoningTrace' && (
                      <div className="space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-[#484848]">HASH</span>
                          <span className="text-pos text-[10px] truncate max-w-[200px]">{data?.reason_hash}</span>
                        </div>
                        <div className="flex justify-between border-t border-white/5 pt-1">
                          <span className="text-[#484848]">ACTION</span>
                          <span className="text-accent text-[10px]">{data?.action}</span>
                        </div>
                      </div>
                    )}
                    {type === 'RiskVerdict' && (
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${data?.status === 'CRITICAL' ? 'bg-neg/20 text-neg' : 'bg-warn/20 text-warn'}`}>
                          {data?.status}
                        </span>
                        <span className="text-white font-bold">{data?.leverage?.toFixed(2)}x LEVERAGE</span>
                      </div>
                    )}
                    {type === 'RescueComplete' && (
                      <div className="space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-[#484848]">RESCUED</span>
                          <span className="text-pos font-bold">${data?.amount?.toLocaleString()} USDC</span>
                        </div>
                        <div className="flex justify-between border-t border-white/5 pt-1">
                          <span className="text-[#484848]">LATENCY</span>
                          <span className="text-accent">{data?.latency_ms?.toFixed(0)}ms</span>
                        </div>
                      </div>
                    )}
                    {type === 'PositionUpdate' && (
                      <div className="flex items-center justify-between">
                        <span className="text-white font-bold">{data?.symbol}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[#484848]">MARGIN</span>
                          <span className={`font-bold ${data?.margin_ratio < 0.12 ? 'text-neg' : 'text-pos'}`}>
                            {(data?.margin_ratio * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    )}
                    {type === 'ANALYTICS_UPDATE' && (
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
                        <span className="text-[#484848]">TOTAL VOL</span>
                        <span className="text-pos text-right">${data?.total_rescued_usdc?.toLocaleString()}</span>
                        <span className="text-[#484848]">AVG LATENCY</span>
                        <span className="text-accent text-right">{data?.avg_latency_ms}ms</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {events.length > maxItems && (
        <div className="mt-6 pt-4 border-t border-white/5">
          <p className="text-[10px] text-[#484848] font-mono text-center uppercase tracking-widest">
            +{events.length - maxItems} deeper signals in buffer
          </p>
        </div>
      )}
    </motion.div>
  );
});

EventFeed.displayName = 'EventFeed';
