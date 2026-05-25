'use client';

import { useState } from 'react';
import { ShieldAlert, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  targetMode: 'sentinel' | 'trading';
}

export const ModeToggleModal = ({ isOpen, onClose, onConfirm, targetMode }: Props) => {
  const [dontAskAgain, setDontAskAgain] = useState(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="agora-card max-w-md w-full p-8 space-y-8 relative z-10 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border-white/10"
          >
            {/* Header Icon & Title */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className={`p-4 rounded-2xl ${
                targetMode === 'trading' 
                  ? 'bg-purple-500/10 text-purple-500' 
                  : 'bg-[#00A3FF]/10 text-[#00A3FF]'
              }`}>
                {targetMode === 'trading' ? <Zap className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Enable {targetMode === 'trading' ? 'Trading Autonomy' : 'Guardian Mode'}
              </h2>
            </div>

            {/* Warning Box */}
            <div className={`p-4 rounded-xl border flex gap-4 ${
              targetMode === 'trading'
                ? 'bg-red-500/5 border-red-500/20 text-red-200'
                : 'bg-[#00A3FF]/5 border-[#00A3FF]/20 text-[#00A3FF]/80'
            }`}>
              <div className="mt-1">
                <AlertTriangle className="w-5 h-5 shrink-0" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest">
                  {targetMode === 'trading' ? 'Action Required: High Risk' : 'Mode Change'}
                </p>
                <p className="text-sm leading-relaxed opacity-80">
                  {targetMode === 'trading' 
                    ? "Switching to Trading Agent mode grants the system full autonomy to execute market orders. You assume all responsibility for automated execution risks."
                    : "Guardian mode deactivates automated trading. The agent will only perform risk-based rescues to prevent liquidations."}
                </p>
              </div>
            </div>

            {/* Checklist */}
            <div className="space-y-3">
              {[
                targetMode === 'trading' ? "Automated Order Execution" : "Risk-Only Monitoring",
                "Arc Network Reason Pinning",
                "Vault Authorization Required"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-xs text-[#8A93A3] font-medium">
                  <div className="w-1 h-1 rounded-full bg-[#00A3FF]" />
                  {item}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 p-1">
              <input 
                type="checkbox" 
                id="dontAsk" 
                checked={dontAskAgain}
                onChange={(e) => setDontAskAgain(e.target.checked)}
                className="w-4 h-4 rounded border-white/10 bg-white/5 text-[#00A3FF] focus:ring-0 focus:ring-offset-0 transition-all cursor-pointer"
              />
              <label htmlFor="dontAsk" className="text-xs text-[#8A93A3] font-medium cursor-pointer hover:text-white transition-colors">
                Do not ask me again for this session
              </label>
            </div>

            <div className="flex gap-4 pt-2">
              <button 
                onClick={onClose} 
                className="flex-1 px-6 py-3 rounded-xl text-sm font-bold text-[#8A93A3] hover:bg-white/5 hover:text-white transition-all border border-transparent hover:border-white/10"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (dontAskAgain) localStorage.setItem('skipModeToggleWarning', 'true');
                  onConfirm();
                  onClose();
                }} 
                className={`flex-1 px-6 py-3 rounded-xl font-black text-sm transition-all shadow-lg ${
                  targetMode === 'trading'
                    ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/20'
                    : 'bg-[#00A3FF] hover:bg-[#00B2FF] text-white shadow-[#00A3FF]/20'
                }`}
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
