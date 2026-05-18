'use client';

import React, { memo, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';

interface MarginHistoryChartProps {
  data: { timestamp: number; ratio: number }[];
}

export const MarginHistoryChart = memo<MarginHistoryChartProps>(({ data }) => {
  const chartData = useMemo(
    () =>
      data.map((point) => ({
        time: new Date(point.timestamp).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        margin: (point.ratio * 100).toFixed(1),
        raw: point.ratio,
      })),
    [data]
  );

  const currentMargin = chartData.length > 0 ? chartData[chartData.length - 1].margin : '0';
  const avgMargin = useMemo(() => {
    const avg = data.reduce((sum, p) => sum + p.ratio, 0) / (data.length || 1);
    return (avg * 100).toFixed(1);
  }, [data]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="agora-card p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-md font-medium tracking-wide text-white">Margin Ratio History</h3>
        <div className="flex gap-6 text-right">
          <div>
            <p className="text-[10px] text-[#787878] uppercase tracking-widest">Current</p>
            <p className="text-xl font-bold text-[#00D98F]">{currentMargin}%</p>
          </div>
          <div>
            <p className="text-[10px] text-[#787878] uppercase tracking-widest">Average</p>
            <p className="text-xl font-bold text-[#00A3FF]">{avgMargin}%</p>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height={256}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -30, bottom: 5 }}>
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
              domain={[0, 50]}
              label={{ value: '%', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e1e1e',
                border: '1px solid #3a3a3a',
                borderRadius: 4,
              }}
              labelStyle={{ color: '#787878' }}
              formatter={(value: string) => `${value}%`}
            />
            <Line
              type="monotone"
              dataKey="margin"
              stroke="#00D98F"
              strokeWidth={2}
              dot={{ fill: '#00D98F', r: 3 }}
              activeDot={{ r: 5 }}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 p-3 bg-[#0B0E14] border border-[#1e1e1e] rounded text-[10px] text-[#787878]">
        <p>⚠️ Safety threshold: 12% minimum margin. Current status: {parseFloat(currentMargin) >= 12 ? '✓ Safe' : '✗ At Risk'}</p>
      </div>
    </motion.div>
  );
});

MarginHistoryChart.displayName = 'MarginHistoryChart';
