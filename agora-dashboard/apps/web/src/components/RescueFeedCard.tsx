import { useWebSocketData } from '@/contexts/WebSocketContext';
import { formatRelativeTime, formatUSDC } from '@/lib/utils';
import { CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import { ARC_BLOCK_EXPLORER } from '@/lib/constants';

export function RescueFeedCard() {
  const { rescueHistory } = useWebSocketData();

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Rescue Operations</h2>
        <span className="text-xs text-muted-foreground">
          {rescueHistory.length} total
        </span>
      </div>

      <div className="space-y-3">
        {rescueHistory.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <p>No rescue operations yet</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {rescueHistory.map((rescue, index) => (
              <div
                key={index}
                className={`rounded-lg border p-4 ${
                  rescue.status === 'SUCCESS'
                    ? 'border-green-500/20 bg-green-500/5'
                    : 'border-red-500/20 bg-red-500/5'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    {rescue.status === 'SUCCESS' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                    )}
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-sm font-semibold ${
                            rescue.status === 'SUCCESS' ? 'text-green-500' : 'text-red-500'
                          }`}
                        >
                          {rescue.status}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(rescue.timestamp)}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Amount</span>
                          <span className="font-semibold">{formatUSDC(rescue.amount)}</span>
                        </div>
                      </div>

                      {/* Transaction Hash */}
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Transaction Hash</p>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 text-xs font-mono bg-muted px-2 py-1 rounded truncate">
                            {rescue.tx_hash}
                          </code>
                          <a
                            href={`${ARC_BLOCK_EXPLORER}/tx/${rescue.tx_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>

                      {/* Reasoning Hash */}
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Reasoning Hash</p>
                        <code className="block text-xs font-mono bg-muted px-2 py-1 rounded truncate">
                          {rescue.reason_hash}
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {rescueHistory.length > 0 && (
        <div className="mt-6 pt-4 border-t border-border">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Total Rescues</p>
              <p className="text-lg font-bold">{rescueHistory.length}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Successful</p>
              <p className="text-lg font-bold text-green-500">
                {rescueHistory.filter((r) => r.status === 'SUCCESS').length}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Amount</p>
              <p className="text-lg font-bold">
                {formatUSDC(rescueHistory.reduce((sum, r) => sum + r.amount, 0))}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
