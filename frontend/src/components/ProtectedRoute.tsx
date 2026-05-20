'use client';

import { useWalletStore } from '@/stores/walletStore';
import { Lock, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isConnected, setIsModalOpen } = useWalletStore();

  if (!isConnected) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="agora-card max-w-md w-full p-8 text-center space-y-6"
        >
          <div className="w-16 h-16 rounded-full bg-[#FF3B3B]/10 border border-[#FF3B3B]/20 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8 text-[#FF3B3B]" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white tracking-tight">Access Restricted</h2>
            <p className="text-sm text-[#8A93A3] leading-relaxed">
              The requested section contains sensitive agent configuration and financial controls. Please connect your wallet to continue.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#00A3FF] hover:bg-[#008BDB] text-white rounded-xl font-bold text-sm transition-all shadow-[0_0_20px_rgba(0,163,255,0.3)] active:scale-95"
          >
            <Lock className="w-4 h-4" />
            <span>Connect Wallet to Unlock</span>
          </button>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
