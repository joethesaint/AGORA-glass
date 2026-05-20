import { useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import { ConnectWallet } from '@/components/ConnectWallet';
import { useWallet } from '@/contexts/WalletContext';

interface OnboardingProps {
  onComplete: (accountAddress: string) => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const { isConnected } = useWallet();
  const [isTestMode, setIsTestMode] = useState(
    localStorage.getItem('circle_skip_test') === 'true'
  );
  const [accountAddress, setAccountAddress] = useState(
    localStorage.getItem('hyperliquid_account') || ''
  );
  const [vaultAmount, setVaultAmount] = useState('500');

  const handleSkipForTesting = () => {
    localStorage.setItem('circle_skip_test', 'true');
    setIsTestMode(true);
  };

  const handleContinue = () => {
    if (!accountAddress) {
      alert('Please enter your Hyperliquid account address');
      return;
    }
    localStorage.setItem('hyperliquid_account', accountAddress);
    onComplete(accountAddress);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">Welcome to GLASS</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Gateway Liquidation Autonomous Safety Sentinel
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  1
                </div>
                <h2 className="text-xl font-semibold">Connect Your Wallet</h2>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSkipForTesting}
              >
                Skip for Testing
              </Button>
            </div>
            <ConnectWallet />
          </div>

          {(isConnected || isTestMode) && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  2
                </div>
                <h2 className="text-xl font-semibold">Configure Monitoring</h2>
              </div>
              <div className="rounded-lg border border-border bg-card p-6">
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">
                      Hyperliquid Account Address
                    </label>
                    <input
                      type="text"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="0x..."
                      value={accountAddress}
                      onChange={(e) => setAccountAddress(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      The Hyperliquid account you want to monitor for liquidation risk
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">
                      Vault Deposit Amount (USDC)
                    </label>
                    <input
                      type="number"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="500"
                      value={vaultAmount}
                      onChange={(e) => setVaultAmount(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Amount of USDC to deposit for emergency rescues (recommended: 500+)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {(isConnected || isTestMode) && accountAddress && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  3
                </div>
                <h2 className="text-xl font-semibold">Start Monitoring</h2>
              </div>
              <div className="rounded-lg border border-border bg-card p-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm">
                      <strong>Account:</strong> {accountAddress.slice(0, 6)}...{accountAddress.slice(-4)}
                    </p>
                    <p className="text-sm">
                      <strong>Vault Amount:</strong> ${vaultAmount} USDC
                    </p>
                  </div>
                  <Button onClick={handleContinue} className="w-full">
                    Start Monitoring
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
