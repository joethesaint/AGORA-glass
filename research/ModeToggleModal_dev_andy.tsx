import { useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  targetMode: 'sentinel' | 'trading';
}

export function ModeToggleModal({ isOpen, onClose, onConfirm, targetMode }: Props) {
  const [dontAskAgain, setDontAskAgain] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="max-w-sm w-full p-6 space-y-6 bg-card border border-border rounded-xl">
        <div className="flex items-center gap-3 text-destructive">
          <ShieldAlert className="w-6 h-6" />
          <h2 className="text-lg font-bold">
            Enable {targetMode === 'trading' ? 'Trading Autonomy' : 'Guardian Mode'}
          </h2>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          {targetMode === 'trading' 
            ? "WARNING: Switching to Trading Agent mode grants the agent full autonomy to execute market orders. You assume full risk for all automated trades."
            : "Switching to Guardian mode will cease all automated trading and return the agent to risk-only liquidation protection."}
        </p>

        <div className="flex items-center gap-2">
          <input 
            type="checkbox" 
            id="dontAsk" 
            checked={dontAskAgain}
            onChange={(e) => setDontAskAgain(e.target.checked)}
            className="rounded border-input bg-background"
          />
          <label htmlFor="dontAsk" className="text-xs text-muted-foreground">
            Do not ask me again
          </label>
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={onClose} 
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button 
            onClick={() => {
              if (dontAskAgain) localStorage.setItem('skipModeToggleWarning', 'true');
              onConfirm();
              onClose();
            }} 
            variant="destructive"
            className="flex-1"
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
}
