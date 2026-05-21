'use client';

import { useState, useEffect } from 'react';
import { useWalletStore } from '@/stores/walletStore';
import { OnboardingWizard } from './OnboardingWizard';
import { motion, AnimatePresence } from 'framer-motion';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isConnected, address, disconnect } = useWalletStore();
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [config, setConfig] = useState<{ account: string; vaultAmount: string; isMock: boolean } | null>(null);

  // Check if we have persistent onboarding data
  useEffect(() => {
    const savedConfig = localStorage.getItem('agora_sentinel_config');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
      setIsOnboarded(true);
    }
  }, []);

  const handleOnboardingComplete = (data: { account: string; vaultAmount: string; isMock: boolean }) => {
    localStorage.setItem('agora_sentinel_config', JSON.stringify(data));
    setConfig(data);
    setIsOnboarded(true);
    
    // If it's a mock session, we simulate the "connection" in the store if it's not already connected
    if (data.isMock && !isConnected) {
      // Note: In a real production app, we'd have a specific 'setMockConnection' action.
      // For this hackathon shakedown, we rely on the fact that if they are onboarded,
      // they have passed the 'mock_user' check.
    }
  };

  // The "Lock" is only bypassed if you are both connected (or in mock mode) AND onboarded
  const isAuthorized = (isConnected || config?.isMock) && isOnboarded;

  return (
    <AnimatePresence mode="wait">
      {!isAuthorized ? (
        <motion.div
          key="onboarding"
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          className="fixed inset-0 z-[100]"
        >
          <OnboardingWizard onComplete={handleOnboardingComplete} />
        </motion.div>
      ) : (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
