import { useWebSocketData } from '@/contexts/WebSocketContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { MAX_LEVERAGE } from '@/lib/constants';
import { format } from 'date-fns';

export function LeverageHistoryChart() {
  const { positionHistory } = useWebSocketData();

  if (positionHistory.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="text-lg font-semibold mb-4">Leverage History</h3>
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <p>Waiting for position data...</p>
        </div>
      </div>
    );
  }

  const chartData = positionHistory.slice(-20).map((position) => ({
    time: format(new Date(position.timestamp), 'HH:mm:ss'),
    leverage: position.leverage,
    timestamp: position.timestamp,
  }));

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Leverage History</h3>
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
            label={{ value: 'Leverage', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))' }}
            domain={[0, 10]}
            stroke="hsl(var(--border))"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '0.5rem',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
            formatter={(value) => [`${Number(value).toFixed(2)}x`, 'Leverage']}
          />
          
          <ReferenceLine
            y={MAX_LEVERAGE}
            stroke="hsl(var(--destructive))"
            strokeDasharray="3 3"
            label={{
              value: 'Max 5x',
              fill: 'hsl(var(--destructive))',
              fontSize: 12,
            }}
          />
          
          <Line
            type="monotone"
            dataKey="leverage"
            stroke="hsl(var(--chart-1))"
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--chart-1))', r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 flex items-center justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-blue-500" />
          <span>Leverage</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-0.5 w-6 bg-destructive" />
          <span>Max 5x</span>
        </div>
      </div>
    </div>
  );
}
