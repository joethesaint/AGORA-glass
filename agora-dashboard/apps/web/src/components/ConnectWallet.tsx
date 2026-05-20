import { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { Button } from '@workspace/ui/components/button';

export function ConnectWallet() {
  const { isConnected, walletAddress, disconnect } = useWallet();
  const [appId, setAppId] = useState(localStorage.getItem('circle_app_id') || '');

  if (isConnected && walletAddress) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Connected Wallet</p>
              <p className="font-mono text-sm font-medium">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </p>
            </div>
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          </div>
          <Button variant="outline" onClick={disconnect} className="w-full">
            Disconnect
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Circle App ID</label>
          <input
            type="text"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="Enter your Circle App ID"
            value={appId}
            onChange={(e) => setAppId(e.target.value)}
          />
        </div>

        <p className="text-sm text-muted-foreground">
          Circle wallet integration is optional for testing. Use the "Skip for Testing" button to proceed without wallet connection.
        </p>

        <p className="text-xs text-muted-foreground text-center">
          Get your Circle App ID from{' '}
          <a
            href="https://console.circle.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Circle Developer Console
          </a>
        </p>
      </div>
    </div>
  );
}
