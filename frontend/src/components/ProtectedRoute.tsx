'use client';

import { useState, useEffect } from 'react';
import { useWalletStore } from '@/stores/walletStore';
import { OnboardingWizard } from './OnboardingWizard';
import { motion, AnimatePresence } from 'framer-motion';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isConnected, onboardingData, isOnboarded: walletIsOnboarded, setOnboardingData, setOnboarded } = useWalletStore();
  const [isReady, setIsReady] = useState(false);

  // Mark ready on mount to avoid hydration mismatch
  useEffect(() => {
    setIsReady(true);
  }, []);

  if (!isReady) return <div className="min-h-screen bg-[#0B0E14]" />;

  const isAuthorized = (isConnected || onboardingData?.isMock) && walletIsOnboarded;

  const handleOnboardingComplete = (data: { account: string; vaultAmount: string; isMock: boolean }) => {
    setOnboardingData(data);
    setOnboarded(true);
  };

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
