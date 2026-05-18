'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Globe, User, Wallet, ChevronRight, Zap, Lock } from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWeb2: () => void;
  onSelectWeb3: () => void;
}

export const UnifiedWalletModal = ({ isOpen, onClose, onSelectWeb2, onSelectWeb3 }: WalletModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-[101]">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-3xl agora-card p-0 overflow-hidden pointer-events-auto mx-4"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Connect to GLASS</h2>
                  <p className="text-xs text-[#8A93A3] mt-1 uppercase tracking-widest font-medium">Choose your preferred entry protocol</p>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-[#484848]" />
                </button>
              </div>

              {/* Selection Area */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5">
                
                {/* Web2 Option */}
                <button 
                  onClick={onSelectWeb2}
                  className="group relative bg-[#0B0E14] p-8 text-left hover:bg-white/[0.02] transition-all"
                >
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="w-5 h-5 text-[#00D98F]" />
                  </div>
                  
                  <div className="w-12 h-12 rounded-2xl bg-[#00D98F]/10 border border-[#00D98F]/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <User className="w-6 h-6 text-[#00D98F]" />
                  </div>
                  
                  <h3 className="text-lg font-bold text-white mb-2">Web2 Onboarding</h3>
                  <p className="text-sm text-[#8A93A3] leading-relaxed mb-6">
                    Sign in with email or social accounts. Powered by Circle Programmable Wallets for a seamless, gas-less experience.
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-[#00D98F] uppercase tracking-widest">
                      <Zap className="w-3 h-3" /> No Seed Phrases
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-[#00D98F] uppercase tracking-widest">
                      <Lock className="w-3 h-3" /> Managed Security
                    </div>
                  </div>
                </button>

                {/* Web3 Option */}
                <button 
                  onClick={onSelectWeb3}
                  className="group relative bg-[#0B0E14] p-8 text-left hover:bg-white/[0.02] transition-all"
                >
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="w-5 h-5 text-[#00A3FF]" />
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-[#00A3FF]/10 border border-[#00A3FF]/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Globe className="w-6 h-6 text-[#00A3FF]" />
                  </div>
                  
                  <h3 className="text-lg font-bold text-white mb-2">Web3 Native</h3>
                  <p className="text-sm text-[#8A93A3] leading-relaxed mb-6">
                    Connect your own wallet (MetaMask, WalletConnect). Full custody and control over your assets on Arc Testnet.
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-[#00A3FF] uppercase tracking-widest">
                      <Shield className="w-3 h-3" /> Self-Custody
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-[#00A3FF] uppercase tracking-widest">
                      <Wallet className="w-3 h-3" /> Use Your Own Keys
                    </div>
                  </div>
                </button>

              </div>

              {/* Footer */}
              <div className="p-4 bg-white/[0.02] border-t border-white/5 text-center">
                <p className="text-[10px] text-[#484848] uppercase tracking-[0.2em]">
                  Transparent • Autonomous • Secure
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
