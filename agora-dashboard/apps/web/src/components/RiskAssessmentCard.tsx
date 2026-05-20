import { useWebSocketData } from '@/contexts/WebSocketContext';
import { formatPercentage, formatRelativeTime } from '@/lib/utils';
import { AlertTriangle, Shield, TrendingUp } from 'lucide-react';

export function RiskAssessmentCard() {
  const { latestRiskVerdict, volatility } = useWebSocketData();

  if (!latestRiskVerdict) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Risk Assessment</h2>
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <p>Waiting for risk assessment...</p>
        </div>
      </div>
    );
  }

  const isCritical = latestRiskVerdict.status === 'CRITICAL';
  const riskRating = latestRiskVerdict.risk_rating;
  const symbolVolatility = volatility[latestRiskVerdict.symbol] || 1.0;

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Risk Assessment</h2>
        <span className="text-xs text-muted-foreground">
          {formatRelativeTime(latestRiskVerdict.timestamp)}
        </span>
      </div>

      <div className="space-y-6">
        {/* Risk Status Badge */}
        <div className="flex items-center justify-center">
          <div
            className={`flex items-center gap-3 rounded-lg px-6 py-4 ${
              isCritical
                ? 'bg-red-500/10 border-2 border-red-500'
                : 'bg-green-500/10 border-2 border-green-500'
            }`}
          >
            {isCritical ? (
              <AlertTriangle className="h-8 w-8 text-red-500" />
            ) : (
              <Shield className="h-8 w-8 text-green-500" />
            )}
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <p
                className={`text-2xl font-bold ${
                  isCritical ? 'text-red-500' : 'text-green-500'
                }`}
              >
                {latestRiskVerdict.status}
              </p>
            </div>
          </div>
        </div>

        {/* Risk Rating */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Risk Rating</span>
            <span className="text-lg font-bold">{riskRating}/5</span>
          </div>
          
          {/* Star Rating */}
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <div
                key={star}
                className={`h-8 w-8 rounded ${
                  star <= riskRating
                    ? star <= 2
                      ? 'bg-green-500'
                      : star <= 3
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>
          
          <p className="text-xs text-muted-foreground">
            {riskRating <= 2
              ? 'Low risk - Position is safe'
              : riskRating <= 3
              ? 'Moderate risk - Monitor closely'
              : 'High risk - Rescue may be needed'}
          </p>
        </div>

        {/* Current Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Margin</p>
            <p className="text-lg font-semibold">
              {formatPercentage(latestRiskVerdict.margin)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Leverage</p>
            <p className="text-lg font-semibold">{latestRiskVerdict.leverage.toFixed(2)}x</p>
          </div>
        </div>

        {/* Market Volatility */}
        <div className="space-y-2 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Market Volatility</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full transition-all duration-500 ${
                    symbolVolatility > 1.5
                      ? 'bg-red-500'
                      : symbolVolatility > 1.2
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min((symbolVolatility / 2) * 100, 100)}%` }}
                />
              </div>
            </div>
            <span className="ml-4 text-sm font-medium">{symbolVolatility.toFixed(2)}x</span>
          </div>
          
          <p className="text-xs text-muted-foreground">
            {symbolVolatility > 1.5
              ? 'High volatility - Increased risk'
              : symbolVolatility > 1.2
              ? 'Moderate volatility'
              : 'Low volatility - Stable market'}
          </p>
        </div>

        {/* Symbol */}
        <div className="pt-2">
          <p className="text-xs text-muted-foreground">Symbol</p>
          <p className="text-sm font-medium">{latestRiskVerdict.symbol}</p>
        </div>
      </div>
    </div>
  );
}
