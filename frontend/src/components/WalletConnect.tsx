'use client';

import { useWalletStore } from '@/stores/walletStore';
import { Wallet, LogOut, Loader2, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UnifiedWalletModal } from './UnifiedWalletModal';

export const WalletConnect = () => {
  const { address, isConnected, isConnecting, connect, disconnect, chain, isModalOpen, setIsModalOpen } = useWalletStore();
  const [showDropdown, setShowDropdown] = useState(false);

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const handleConnect = (type: 'web2' | 'web3') => {
    connect(type);
  };

  if (!isConnected) {
    return (
      <>
        <button
          onClick={() => setIsModalOpen(true)}
          disabled={isConnecting}
          className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-[#008BDB] disabled:bg-accent/50 text-white rounded-xl font-bold text-sm transition-all shadow-[0_0_20px_rgba(0,163,255,0.3)] active:scale-95"
        >
          {isConnecting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <Wallet className="w-4 h-4" />
              <span>Connect Wallet</span>
            </>
          )}
        </button>

        <UnifiedWalletModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSelectWeb2={() => handleConnect('web2')}
          onSelectWeb3={() => handleConnect('web3')}
        />
      </>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-3 px-3 py-2 bg-[#1E2532] border border-[#2D3748] hover:border-[#4A5568] rounded-xl transition-all group"
      >
        <div className="w-2 h-2 rounded-full bg-pos animate-pulse" />
        <div className="text-left hidden sm:block">
          <p className="text-[10px] text-muted font-mono leading-none mb-1">{chain}</p>
          <p className="text-sm font-bold font-mono text-white leading-none">{formatAddress(address!)}</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {showDropdown && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setShowDropdown(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute right-0 mt-2 w-48 bg-[#1A202C] border border-[#2D3748] rounded-xl shadow-2xl z-20 overflow-hidden"
            >
              <div className="p-3 border-b border-[#2D3748] bg-[#2D3748]/30">
                <p className="text-[10px] text-muted uppercase font-bold tracking-widest mb-1">Status</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-pos" />
                  <span className="text-xs text-[#F2F2F2]">Verified Sentinel</span>
                </div>
              </div>
              <button
                onClick={() => {
                  disconnect();
                  setShowDropdown(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-neg hover:bg-neg/10 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Disconnect</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
