'use client';

import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Event } from './EventFeed';
import { EventType } from '@/types/agent';
import { Activity, AlertCircle, Shield, Zap, Clock } from 'lucide-react';

interface EventStatsCardProps {
  events: Event[];
  lifetimeCount: number;
  lifetimeStats: Record<string, number>;
}

export const EventStatsCard = memo<EventStatsCardProps>(({ events, lifetimeCount, lifetimeStats }) => {
  const stats = useMemo(() => {
    const counts: Record<string, number> = {
      PositionUpdate: 0,
      RiskVerdict: 0,
      ReasoningTrace: 0,
      RescueComplete: 0,
    };

    events.forEach((e) => {
      const eventType = e.event_type || e.type;
      if (counts.hasOwnProperty(eventType)) {
        counts[eventType] = counts[eventType] + 1;
      }
    });

    return counts;
  }, [events]);

  const eventCategories = [
    {
      type: 'PositionUpdate',
      label: 'Position Updates',
      icon: Activity,
      color: 'text-[#00A3FF]',
      bgColor: 'bg-[#00A3FF]/10',
    },
    {
      type: 'RiskVerdict',
      label: 'Risk Verdicts',
      icon: AlertCircle,
      color: 'text-[#F5A623]',
      bgColor: 'bg-[#F5A623]/10',
    },
    {
      type: 'ReasoningTrace',
      label: 'Reasoning Traces',
      icon: Shield,
      color: 'text-[#d4ff3e]',
      bgColor: 'bg-[#d4ff3e]/10',
    },
    {
      type: 'RescueComplete',
      label: 'Rescue Complete',
      icon: Zap,
      color: 'text-[#00D98F]',
      bgColor: 'bg-[#00D98F]/10',
    },
  ];

  const total = events.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="agora-card p-6"
    >
      <h3 className="text-md font-medium tracking-wide text-white mb-6">Event Distribution</h3>

      <div className="space-y-4">
        {eventCategories.map((cat) => {
          const Icon = cat.icon;
          const count = stats[cat.type] || 0;
          const lifetimeCountForType = lifetimeStats[cat.type] || 0;
          const percentage = lifetimeCount > 0 ? (lifetimeCountForType / lifetimeCount) * 100 : 0;

          return (
            <motion.div
              key={cat.type}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${cat.color}`} />
                  <span className="text-[10px] text-[#787878] uppercase tracking-widest">{cat.label}</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[10px]">
                  <span className="text-[#F2F2F2] font-semibold">{count}</span>
                  <span className="text-[#484848]">/</span>
                  <span className="text-[#8A93A3]">{lifetimeCountForType}</span>
                </div>
              </div>
              <div className="w-full h-1.5 bg-[#1e1e1e] rounded overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5 }}
                  className={`h-full ${cat.bgColor}`}
                />
              </div>
              <p className="text-[9px] text-[#787878]">{percentage.toFixed(1)}% of all events</p>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-[#1e1e1e] grid grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] text-[#787878] uppercase tracking-widest">Buffer Events</p>
          <p className="text-2xl font-bold text-[#00A3FF]">{total}</p>
        </div>
        <div>
          <p className="text-[10px] text-[#787878] uppercase tracking-widest">Lifetime Events</p>
          <motion.p
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            className="text-2xl font-bold text-[#d4ff3e]"
          >
            {lifetimeCount}
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
});

EventStatsCard.displayName = 'EventStatsCard';
