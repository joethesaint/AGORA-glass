'use client';

import React, { memo, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';

interface LeverageChartProps {
  data: { timestamp: number; leverage: number }[];
}

export const LeverageChart = memo<LeverageChartProps>(({ data }) => {
  const chartData = useMemo(
    () =>
      data.map((point) => ({
        time: new Date(point.timestamp).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        leverage: point.leverage.toFixed(1),
        raw: point.leverage,
      })),
    [data]
  );

  const currentLeverage = chartData.length > 0 ? chartData[chartData.length - 1].leverage : '0';
  const maxLeverage = useMemo(
    () => Math.max(...data.map((p) => p.leverage)).toFixed(1),
    [data]
  );

  const getLeverageColor = (lev: number): string => {
    if (lev > 5) return '#FF3B3B';
    if (lev > 3) return '#F5A623';
    return '#00D98F';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="agora-card p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-md font-medium tracking-wide text-white">Leverage Trend</h3>
        <div className="flex gap-6 text-right">
          <div>
            <p className="text-[10px] text-[#787878] uppercase tracking-widest">Current</p>
            <p
              className="text-xl font-bold"
              style={{ color: getLeverageColor(parseFloat(currentLeverage)) }}
            >
              {currentLeverage}x
            </p>
          </div>
          <div>
            <p className="text-[10px] text-[#787878] uppercase tracking-widest">Max</p>
            <p
              className="text-xl font-bold"
              style={{ color: getLeverageColor(parseFloat(maxLeverage)) }}
            >
              {maxLeverage}x
            </p>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height={256}>
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -30, bottom: 5 }}>
            <defs>
              <linearGradient id="colorLeverage" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={getLeverageColor(parseFloat(currentLeverage))} stopOpacity={0.3} />
                <stop offset="95%" stopColor={getLeverageColor(parseFloat(currentLeverage))} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
            <XAxis
              dataKey="time"
              stroke="#787878"
              tick={{ fill: '#787878', fontSize: 10 }}
              interval={Math.floor(chartData.length / 4)}
            />
            <YAxis
              stroke="#787878"
              tick={{ fill: '#787878', fontSize: 10 }}
              domain={[0, 6]}
              label={{ value: 'x', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e1e1e',
                border: '1px solid #3a3a3a',
                borderRadius: 4,
              }}
              labelStyle={{ color: '#787878' }}
              formatter={(value: string) => `${value}x`}
            />
            <Area
              type="monotone"
              dataKey="leverage"
              stroke={getLeverageColor(parseFloat(currentLeverage))}
              fillOpacity={1}
              fill="url(#colorLeverage)"
              isAnimationActive={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 p-3 bg-[#0B0E14] border border-[#1e1e1e] rounded text-[10px] text-[#787878]">
        <p>⚠️ Safety threshold: 5x maximum leverage. Current status: {parseFloat(currentLeverage) <= 5 ? '✓ Safe' : '✗ Exceeds Limit'}</p>
      </div>
    </motion.div>
  );
});

LeverageChart.displayName = 'LeverageChart';
