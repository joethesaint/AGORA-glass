import { useWebSocketData } from '@/contexts/WebSocketContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { CRITICAL_MARGIN_THRESHOLD, WARNING_MARGIN_THRESHOLD } from '@/lib/constants';
import { format } from 'date-fns';

export function MarginTrendChart() {
  const { positionHistory } = useWebSocketData();

  if (positionHistory.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="text-lg font-semibold mb-4">Margin Ratio Trend</h3>
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <p>Waiting for position data...</p>
        </div>
      </div>
    );
  }

  const chartData = positionHistory.slice(-20).map((position) => ({
    time: format(new Date(position.timestamp), 'HH:mm:ss'),
    margin: position.margin_ratio * 100,
    timestamp: position.timestamp,
  }));

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Margin Ratio Trend</h3>
        <p className="text-sm text-muted-foreground">Last {chartData.length} updates</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis
            dataKey="time"
            className="text-xs"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            stroke="hsl(var(--border))"
          />
          <YAxis
            className="text-xs"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            label={{ value: 'Margin %', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))' }}
            stroke="hsl(var(--border))"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '0.5rem',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
          />
          
          <ReferenceLine
            y={CRITICAL_MARGIN_THRESHOLD * 100}
            stroke="hsl(var(--destructive))"
            strokeDasharray="3 3"
            label={{
              value: 'Critical (12%)',
              fill: 'hsl(var(--destructive))',
              fontSize: 12,
            }}
          />
          
          <ReferenceLine
            y={WARNING_MARGIN_THRESHOLD * 100}
            stroke="hsl(var(--warning))"
            strokeDasharray="3 3"
            label={{
              value: 'Warning (25%)',
              fill: 'hsl(var(--warning))',
              fontSize: 12,
            }}
          />
          
          <Line
            type="monotone"
            dataKey="margin"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--primary))', r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 flex items-center justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-primary" />
          <span>Margin Ratio</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-0.5 w-6 bg-destructive" />
          <span>Critical (12%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-0.5 w-6 bg-yellow-500" />
          <span>Warning (25%)</span>
        </div>
      </div>
    </div>
  );
}
