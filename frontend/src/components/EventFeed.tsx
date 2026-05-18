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
} from 'lucide-react';

export type EventType = 'PositionUpdate' | 'RiskVerdict' | 'ReasoningTrace' | 'RescueComplete' | 'Unknown';

export interface Event {
  type: EventType;
  timestamp: number;
  data: Record<string, any>;
}

const EVENT_ICONS: Record<EventType, React.ReactNode> = {
  PositionUpdate: <Activity className="w-4 h-4" />,
  RiskVerdict: <AlertCircle className="w-4 h-4" />,
  ReasoningTrace: <Shield className="w-4 h-4" />,
  RescueComplete: <Zap className="w-4 h-4" />,
  Unknown: <Clock className="w-4 h-4" />,
};

const EVENT_COLORS: Record<EventType, { bg: string; text: string; border: string }> = {
  PositionUpdate: { bg: 'bg-[#00A3FF]/10', text: 'text-[#00A3FF]', border: 'border-[#00A3FF]/20' },
  RiskVerdict: { bg: 'bg-[#F5A623]/10', text: 'text-[#F5A623]', border: 'border-[#F5A623]/20' },
  ReasoningTrace: { bg: 'bg-[#d4ff3e]/10', text: 'text-[#d4ff3e]', border: 'border-[#d4ff3e]/20' },
  RescueComplete: { bg: 'bg-[#00D98F]/10', text: 'text-[#00D98F]', border: 'border-[#00D98F]/20' },
  Unknown: { bg: 'bg-[#787878]/10', text: 'text-[#787878]', border: 'border-[#787878]/20' },
};

interface EventTypeIconProps {
  type: EventType;
}

export const EventTypeIcon = memo<EventTypeIconProps>(({ type }) => {
  const colors = EVENT_COLORS[type];
  return (
    <div className={`p-2 rounded border ${colors.bg} ${colors.text} ${colors.border}`}>
      {EVENT_ICONS[type]}
    </div>
  );
});

EventTypeIcon.displayName = 'EventTypeIcon';

interface EventFeedProps {
  events: Event[];
  maxItems?: number;
}

export const EventFeed = memo<EventFeedProps>(({ events, maxItems = 10 }) => {
  const displayEvents = events.slice(0, maxItems);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="agora-card p-6"
    >
      <h3 className="text-md font-medium tracking-wide text-white mb-6">Event Timeline</h3>

      <div className="space-y-3">
        {displayEvents.length === 0 ? (
          <p className="text-[10px] text-[#787878] text-center py-8">No events yet. Waiting for agent signals...</p>
        ) : (
          displayEvents.map((event, idx) => {
            const colors = EVENT_COLORS[event.type];
            const time = new Date(event.timestamp * 1000).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            });

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`flex gap-4 p-3 rounded border ${colors.bg} ${colors.border} hover:bg-opacity-20 transition-colors`}
              >
                <div className="flex-shrink-0 mt-1">
                  <EventTypeIcon type={event.type} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <span className={`text-[10px] font-mono font-semibold ${colors.text} uppercase tracking-widest`}>
                      {event.type}
                    </span>
                    <span className="text-[10px] text-[#787878] whitespace-nowrap">{time}</span>
                  </div>

                  <div className="text-[10px] text-[#F2F2F2] mt-2 space-y-1">
                    {event.type === 'RiskVerdict' && (
                      <>
                        <p>Status: <span className="font-mono font-semibold">{event.data?.status || 'UNKNOWN'}</span></p>
                        {event.data?.leverage && <p>Leverage: <span className="font-mono">{event.data.leverage.toFixed(1)}x</span></p>}
                      </>
                    )}
                    {event.type === 'RescueComplete' && (
                      <>
                        <p>Result: <span className="font-mono font-semibold text-[#00D98F]">{event.data?.status || 'UNKNOWN'}</span></p>
                        {event.data?.amount && <p>Amount: <span className="font-mono">${event.data.amount.toLocaleString()}</span></p>}
                      </>
                    )}
                    {event.type === 'PositionUpdate' && (
                      <>
                        {event.data?.symbol && <p>Symbol: <span className="font-mono">{event.data.symbol}</span></p>}
                        {event.data?.margin_ratio && <p>Margin: <span className="font-mono">{(event.data.margin_ratio * 100).toFixed(1)}%</span></p>}
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {events.length > maxItems && (
        <div className="mt-4 pt-4 border-t border-[#1e1e1e]">
          <p className="text-[10px] text-[#787878] text-center">
            +{events.length - maxItems} more {events.length - maxItems === 1 ? 'event' : 'events'}
          </p>
        </div>
      )}
    </motion.div>
  );
});

EventFeed.displayName = 'EventFeed';
