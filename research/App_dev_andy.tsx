import { useState, useEffect } from "react"
import { Onboarding } from "@/pages/Onboarding"
import { Dashboard } from "@/pages/Dashboard"
import { Analytics } from "@/pages/Analytics"

type View = 'dashboard' | 'analytics';

export function App() {
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [monitoredAccount, setMonitoredAccount] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');

  useEffect(() => {
    const account = localStorage.getItem('hyperliquid_account');
    if (account) {
      setMonitoredAccount(account);
      setIsOnboarded(true);
    }
  }, []);

  const handleOnboardingComplete = (accountAddress: string) => {
    setMonitoredAccount(accountAddress);
    setIsOnboarded(true);
  };

  const handleReset = () => {
    localStorage.removeItem('hyperliquid_account');
    localStorage.removeItem('circle_skip_test');
    setIsOnboarded(false);
    setMonitoredAccount(null);
    setCurrentView('dashboard');
  };

  if (!isOnboarded) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  if (currentView === 'analytics') {
    return (
      <Analytics
        monitoredAccount={monitoredAccount!}
        onBack={() => setCurrentView('dashboard')}
        onReset={handleReset}
      />
    );
  }

  return (
    <Dashboard
      monitoredAccount={monitoredAccount!}
      onReset={handleReset}
      onViewAnalytics={() => setCurrentView('analytics')}
    />
  );
}
