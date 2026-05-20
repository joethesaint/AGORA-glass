import { useWebSocketData } from '@/contexts/WebSocketContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format } from 'date-fns';

export function RescueTimelineChart() {
  const { rescueHistory } = useWebSocketData();

  if (rescueHistory.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="text-lg font-semibold mb-4">Rescue Timeline</h3>
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <p>No rescue operations yet</p>
        </div>
      </div>
    );
  }

  const chartData = rescueHistory
    .slice(0, 10)
    .reverse()
    .map((rescue, index) => ({
      id: `R${index + 1}`,
      amount: rescue.amount,
      status: rescue.status,
      time: format(new Date(rescue.timestamp), 'HH:mm'),
      timestamp: rescue.timestamp,
    }));

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Rescue Timeline</h3>
        <p className="text-sm text-muted-foreground">Last {chartData.length} operations</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="id"
            className="text-xs"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis
            className="text-xs"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            label={{ value: 'Amount (USDC)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '0.5rem',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
            formatter={(value, _name, props) => [
              `$${Number(value).toFixed(2)}`,
              props.payload.status === 'SUCCESS' ? 'Success' : 'Failed',
            ]}
          />
          <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  entry.status === 'SUCCESS'
                    ? 'hsl(var(--chart-2))'
                    : 'hsl(var(--destructive))'
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 flex items-center justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-green-500" />
          <span>Successful</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-destructive" />
          <span>Failed</span>
        </div>
      </div>
    </div>
  );
}
