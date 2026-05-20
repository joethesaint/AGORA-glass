import { useState } from 'react';
import { Shield, Zap } from 'lucide-react';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { PositionHealthCard } from '@/components/PositionHealthCard';
import { RiskAssessmentCard } from '@/components/RiskAssessmentCard';
import { ReasoningTraceCard } from '@/components/ReasoningTraceCard';
import { RescueFeedCard } from '@/components/RescueFeedCard';
import { ModeToggleModal } from '@/components/ModeToggleModal';
import { MarketRegimeBadge } from '@/components/MarketRegimeBadge';
import { Button } from '@workspace/ui/components/button';
import { useWebSocketData } from '@/contexts/WebSocketContext';

interface DashboardProps {
  monitoredAccount: string;
  onReset: () => void;
  onViewAnalytics: () => void;
}

export function Dashboard({ monitoredAccount, onReset, onViewAnalytics }: DashboardProps) {
  const { volatility, marketRegime } = useWebSocketData();
  const [agentMode, setAgentMode] = useState<'sentinel' | 'trading'>('sentinel');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingMode, setPendingMode] = useState<'sentinel' | 'trading'>('sentinel');

  const handleModeToggle = () => {
    const nextMode = agentMode === 'sentinel' ? 'trading' : 'sentinel';
    const skipWarning = localStorage.getItem('skipModeToggleWarning') === 'true';

    if (skipWarning) {
      setAgentMode(nextMode);
      // TODO: Send WebSocket signal to backend to change mode
    } else {
      setPendingMode(nextMode);
      setIsModalOpen(true);
    }
  };

  const handleConfirmModeChange = () => {
    setAgentMode(pendingMode);
    // TODO: Send WebSocket signal to backend to change mode
  };

  const avgVolatility = Object.values(volatility).reduce((a, b) => a + b, 0) / Object.keys(volatility).length || 0.5;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold">GLASS Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Monitoring: {monitoredAccount.slice(0, 6)}...{monitoredAccount.slice(-4)}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <MarketRegimeBadge regime={marketRegime} volatility={avgVolatility} />
            <ConnectionStatus />
            <Button 
              variant={agentMode === 'trading' ? 'default' : 'outline'} 
              size="sm" 
              onClick={handleModeToggle}
              className="gap-2"
            >
              {agentMode === 'sentinel' ? <Shield className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
              {agentMode === 'sentinel' ? 'Sentinel Mode' : 'Trading Mode'}
            </Button>
            <Button variant="outline" size="sm" onClick={onViewAnalytics}>
              Analytics
            </Button>
            <Button variant="outline" size="sm" onClick={onReset}>
              Reset
            </Button>
          </div>
        </div>
      </header>

      <ModeToggleModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmModeChange}
        targetMode={pendingMode}
      />

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-6">
            <PositionHealthCard />
            <RiskAssessmentCard />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <ReasoningTraceCard />
            <RescueFeedCard />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/50 py-6 mt-12">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>AGORA-glass: Gateway Liquidation Autonomous Safety Sentinel</p>
          <p className="mt-1">Sub-500ms rescue • Glass-Box transparency • Arc Network verified</p>
        </div>
      </footer>
    </div>
  );
}
