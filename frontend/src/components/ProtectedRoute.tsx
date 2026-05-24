'use client';

import { useState, useEffect } from 'react';
import { useWalletStore } from '@/stores/walletStore';
import { OnboardingWizard } from './OnboardingWizard';
import { motion, AnimatePresence } from 'framer-motion';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isConnected } = useWalletStore();
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [config, setConfig] = useState<{ account: string; vaultAmount: string; isMock: boolean } | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Check if we have persistent onboarding data
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('agora_sentinel_config');
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        setConfig(parsed);
        setIsOnboarded(true);
      }
    } catch (err) {
      console.error('🛡️ GLASS: Failed to parse onboarding config', err);
      localStorage.removeItem('agora_sentinel_config');
    } finally {
      setIsReady(true);
    }
  }, []);

  const handleOnboardingComplete = (data: { account: string; vaultAmount: string; isMock: boolean }) => {
    localStorage.setItem('agora_sentinel_config', JSON.stringify(data));
    setConfig(data);
    setIsOnboarded(true);
  };

  if (!isReady) return <div className="min-h-screen bg-[#0B0E14]" />;

  const isAuthorized = (isConnected || config?.isMock) && isOnboarded;

  return (
    <div className="relative min-h-screen bg-[#0B0E14]">
      <AnimatePresence mode="wait" initial={false}>
        {!isAuthorized ? (
          <motion.div
            key="onboarding"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            className="fixed inset-0 z-[100]"
          >
            <OnboardingWizard onComplete={handleOnboardingComplete} />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            className="relative w-full"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
