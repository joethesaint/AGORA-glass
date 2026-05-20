import { useState } from 'react';
import { useWebSocketData } from '@/contexts/WebSocketContext';
import { formatRelativeTime, formatUSDC, copyToClipboard } from '@/lib/utils';
import { Copy, Check, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { ARC_BLOCK_EXPLORER } from '@/lib/constants';

export function ReasoningTraceCard() {
  const { latestReasoningTrace } = useWebSocketData();
  const [copied, setCopied] = useState(false);
  const [showJson, setShowJson] = useState(false);

  if (!latestReasoningTrace) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Glass-Box Reasoning</h2>
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <p>Waiting for reasoning trace...</p>
        </div>
      </div>
    );
  }

  const handleCopyHash = async () => {
    const success = await copyToClipboard(latestReasoningTrace.reason_hash);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Glass-Box Reasoning</h2>
        <span className="text-xs text-muted-foreground">
          {formatRelativeTime(latestReasoningTrace.timestamp)}
        </span>
      </div>

      <div className="space-y-6">
        {/* Action & Agent */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Action</p>
            <p className="text-lg font-semibold text-red-500">{latestReasoningTrace.action}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Agent ID</p>
            <p className="text-sm font-mono">{latestReasoningTrace.agent_id}</p>
          </div>
        </div>

        {/* Reasoning Text */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Reasoning</p>
          <div className="rounded-md bg-muted p-4">
            <p className="text-sm leading-relaxed">{latestReasoningTrace.reasoning_text}</p>
          </div>
        </div>

        {/* Evidence */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Evidence</p>
          <ul className="space-y-2">
            {latestReasoningTrace.evidence.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-muted-foreground">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground">Margin Ratio</p>
            <p className="text-sm font-semibold">
              {(latestReasoningTrace.margin_ratio * 100).toFixed(2)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Leverage</p>
            <p className="text-sm font-semibold">
              {latestReasoningTrace.leverage_before.toFixed(2)}x
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Rescue Amount</p>
            <p className="text-sm font-semibold">
              {formatUSDC(latestReasoningTrace.rescue_amount_usdc)}
            </p>
          </div>
        </div>

        {/* Reasoning Hash */}
        <div className="space-y-2 pt-4 border-t border-border">
          <p className="text-sm font-medium">On-Chain Hash (SHA-256)</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-md bg-muted p-3 font-mono text-xs break-all">
              {latestReasoningTrace.reason_hash}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyHash}
              className="shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {/* Verify on Arc */}
          <a
            href={`${ARC_BLOCK_EXPLORER}/tx/${latestReasoningTrace.reason_hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            Verify on Arc Testnet
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {/* Risk Rating Badge */}
        <div className="flex items-center justify-center pt-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-red-500/10 px-4 py-2 text-sm font-medium text-red-500">
            Risk Rating: {latestReasoningTrace.risk_rating}
          </div>
        </div>

        {/* JSON Viewer Toggle */}
        <div className="pt-4 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowJson(!showJson)}
            className="w-full"
          >
            {showJson ? (
              <>
                <ChevronUp className="h-4 w-4 mr-2" />
                Hide Full JSON
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-2" />
                Show Full JSON
              </>
            )}
          </Button>
          
          {showJson && (
            <div className="mt-3 rounded-md bg-muted p-4 max-h-96 overflow-auto">
              <pre className="text-xs font-mono">
                {JSON.stringify(latestReasoningTrace, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
