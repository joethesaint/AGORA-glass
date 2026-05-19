'use client';

import { useState } from 'react';
import { ShieldAlert, Zap } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  targetMode: 'sentinel' | 'trading';
}

export const ModeToggleModal = ({ isOpen, onClose, onConfirm, targetMode }: Props) => {
  const [dontAskAgain, setDontAskAgain] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="agora-card max-w-sm w-full p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 text-[#FF3B3B]">
          <ShieldAlert className="w-6 h-6" />
          <h2 className="text-lg font-bold text-white">Enable {targetMode === 'trading' ? 'Trading Autonomy' : 'Guardian Mode'}</h2>
        </div>

        <p className="text-sm text-[#8A93A3] leading-relaxed">
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
            className="rounded border-[#1e1e1e] bg-[#0B0E14] text-[#00A3FF] focus:ring-offset-0"
          />
          <label htmlFor="dontAsk" className="text-xs text-[#8A93A3]">Do not ask me again</label>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-white/5 text-white transition-all">
            Cancel
          </button>
          <button 
            onClick={() => {
              if (dontAskAgain) localStorage.setItem('skipModeToggleWarning', 'true');
              onConfirm();
              onClose();
            }} 
            className="flex-1 px-4 py-2 bg-[#FF3B3B] hover:bg-[#FF2020] text-white rounded-xl font-bold text-sm transition-all shadow-[0_0_20px_rgba(255,59,59,0.3)]"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
