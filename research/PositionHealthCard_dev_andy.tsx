import { useWebSocketData } from '@/contexts/WebSocketContext';
import { formatPercentage, getRiskColor, formatRelativeTime } from '@/lib/utils';
import { CRITICAL_MARGIN_THRESHOLD, WARNING_MARGIN_THRESHOLD } from '@/lib/constants';

export function PositionHealthCard() {
  const { currentPosition } = useWebSocketData();

  if (!currentPosition) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Position Health</h2>
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <p>Waiting for position data...</p>
        </div>
      </div>
    );
  }

  const marginRatio = currentPosition.margin_ratio;
  const leverage = currentPosition.leverage;
  const isHealthy = marginRatio >= WARNING_MARGIN_THRESHOLD;
  const isCritical = marginRatio < CRITICAL_MARGIN_THRESHOLD;

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Position Health</h2>
        <span className="text-xs text-muted-foreground">
          {formatRelativeTime(currentPosition.timestamp)}
        </span>
      </div>

      <div className="space-y-6">
        {/* Margin Ratio */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Margin Ratio</span>
            <span className={`text-2xl font-bold ${getRiskColor(marginRatio)}`}>
              {formatPercentage(marginRatio)}
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full transition-all duration-500 ${
                isCritical
                  ? 'bg-red-500'
                  : marginRatio < WARNING_MARGIN_THRESHOLD
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(marginRatio * 100, 100)}%` }}
            />
            {/* Critical threshold marker */}
            <div
              className="absolute top-0 h-full w-0.5 bg-red-700"
              style={{ left: `${CRITICAL_MARGIN_THRESHOLD * 100}%` }}
            />
            {/* Warning threshold marker */}
            <div
              className="absolute top-0 h-full w-0.5 bg-yellow-700"
              style={{ left: `${WARNING_MARGIN_THRESHOLD * 100}%` }}
            />
          </div>

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Critical: {formatPercentage(CRITICAL_MARGIN_THRESHOLD)}</span>
            <span>Warning: {formatPercentage(WARNING_MARGIN_THRESHOLD)}</span>
          </div>
        </div>

        {/* Leverage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Leverage</span>
            <span className={`text-2xl font-bold ${leverage > 5 ? 'text-red-500' : leverage > 3 ? 'text-yellow-500' : 'text-green-500'}`}>
              {leverage.toFixed(2)}x
            </span>
          </div>
          
          {/* Leverage Bar */}
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full transition-all duration-500 ${
                leverage > 5
                  ? 'bg-red-500'
                  : leverage > 3
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${Math.min((leverage / 10) * 100, 100)}%` }}
            />
            {/* 5x max marker */}
            <div className="absolute top-0 h-full w-0.5 bg-red-700" style={{ left: '50%' }} />
          </div>

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1x</span>
            <span className="text-red-500">5x Max</span>
            <span>10x</span>
          </div>
        </div>

        {/* Symbol & Account */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground">Symbol</p>
            <p className="text-sm font-medium">{currentPosition.symbol}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Account</p>
            <p className="text-sm font-medium font-mono">
              {currentPosition.account.slice(0, 6)}...{currentPosition.account.slice(-4)}
            </p>
          </div>
        </div>

        {/* Health Status Badge */}
        <div className="flex items-center justify-center pt-2">
          <div
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${
              isCritical
                ? 'bg-red-500/10 text-red-500'
                : !isHealthy
                ? 'bg-yellow-500/10 text-yellow-500'
                : 'bg-green-500/10 text-green-500'
            }`}
          >
            <div
              className={`h-2 w-2 rounded-full ${
                isCritical ? 'bg-red-500' : !isHealthy ? 'bg-yellow-500' : 'bg-green-500'
              } ${!isCritical && isHealthy ? 'animate-pulse' : ''}`}
            />
            {isCritical ? 'CRITICAL RISK' : !isHealthy ? 'WARNING' : 'HEALTHY'}
          </div>
        </div>
      </div>
    </div>
  );
}
