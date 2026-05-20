import { ConnectionStatus } from '@/components/ConnectionStatus';
import { MarginTrendChart } from '@/components/charts/MarginTrendChart';
import { LeverageHistoryChart } from '@/components/charts/LeverageHistoryChart';
import { RescueTimelineChart } from '@/components/charts/RescueTimelineChart';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useWebSocketData } from '@/contexts/WebSocketContext';
import { formatUSDC } from '@/lib/utils';
import { Button } from '@workspace/ui/components/button';
import { ArrowLeft } from 'lucide-react';

interface AnalyticsProps {
  monitoredAccount: string;
  onBack: () => void;
  onReset: () => void;
}

export function Analytics({ monitoredAccount, onBack, onReset }: AnalyticsProps) {
  const { positionHistory, rescueHistory } = useWebSocketData();

  const totalRescues = rescueHistory.length;
  const successfulRescues = rescueHistory.filter((r) => r.status === 'SUCCESS').length;
  const totalAmount = rescueHistory.reduce((sum, r) => sum + r.amount, 0);
  const successRate = totalRescues > 0 ? (successfulRescues / totalRescues) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Analytics</h1>
              <p className="text-sm text-muted-foreground">
                Monitoring: {monitoredAccount.slice(0, 6)}...{monitoredAccount.slice(-4)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <ConnectionStatus />
            <Button variant="outline" size="sm" onClick={onReset}>
              Reset
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">Total Data Points</p>
            <p className="text-3xl font-bold mt-2">{positionHistory.length}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">Total Rescues</p>
            <p className="text-3xl font-bold mt-2">{totalRescues}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">Success Rate</p>
            <p className="text-3xl font-bold mt-2 text-green-500">{successRate.toFixed(0)}%</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">Total Rescued</p>
            <p className="text-3xl font-bold mt-2">{formatUSDC(totalAmount)}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <MarginTrendChart />
          <LeverageHistoryChart />
          <div className="lg:col-span-2">
            <RescueTimelineChart />
          </div>
        </div>
      </main>

      <footer className="border-t border-border bg-muted/50 py-6 mt-12">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>AGORA-glass Analytics Dashboard</p>
          <p className="mt-1">Real-time position monitoring and rescue analytics</p>
        </div>
      </footer>
    </div>
  );
}
