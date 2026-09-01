import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navigation } from "@/components/Navigation";
import { AlertSystem } from "@/components/AlertSystem";
import { ThemeProvider } from "@/components/ThemeProvider";
import { WalletConnect } from "@/components/WalletConnect";
import { KillSwitchButton } from "@/components/KillSwitchButton";
import { CommandPalette } from "@/components/CommandPalette";

import { OnboardingWizard } from "@/components/OnboardingWizard";
import { useWalletStore } from "@/stores/walletStore";
import { sendWebSocketSignal, useInitAgentSignals } from "@/hooks/useAgentSignals";

// Pages — lazy-loaded per route so a visitor only downloads the page they land
// on (e.g. /analytics and /performance both pull in recharts) instead of every
// route shipping in the single initial bundle.
const DashboardPage = lazy(() => import("@/app/page"));
const TransparencyPage = lazy(() => import("@/app/transparency/page"));
const AnalyticsPage = lazy(() => import("@/app/analytics/page"));
const PerformancePage = lazy(() => import("@/app/performance/page"));
const AboutPage = lazy(() => import("@/app/about/page"));
const SettingsPage = lazy(() => import("@/app/settings/page"));

import "./app/globals.css";

function App() {
  const { isOnboarded, setOnboarded, balance, isConnected } = useWalletStore();

  // Initialize the websocket connection ONCE, without triggering re-renders here.
  useInitAgentSignals();

  if (!isOnboarded) {
    return (
      <ThemeProvider>
        <OnboardingWizard
          onComplete={(data) => {
            console.log('🛡️ GLASS: Onboarding complete, sending config:', data);
            sendWebSocketSignal('CONFIGURE_MONITORING', data);
            useWalletStore.getState().setOnboardingData(data);
            setOnboarded(true);
          }}
        />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground font-sans">
        <header className="flex justify-between items-center px-4 lg:px-6 py-4 border-b border-border sticky top-0 bg-background/80 backdrop-blur-sm z-50">
          <div className='flex items-center gap-4 lg:gap-8'>
            <button
              onClick={() => {
                window.location.href = '/';
              }}
              className="flex flex-col text-left hover:opacity-80 transition-opacity"
            >
              <h1 className="text-2xl lg:text-3xl font-black tracking-tighter glass-text pr-2">
                GLASS
              </h1>
              <span className="text-[9px] uppercase tracking-[0.2em] text-muted -mt-1 ml-0.5">
                by AGORA
              </span>
            </button>
            <Navigation />
          </div>
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] lg:text-[11px] text-muted uppercase">Unified Balance</p>
              <p className="text-base lg:text-xl font-bold text-accent">
                ${isConnected ? balance : '0.00'}
              </p>
            </div>
            <KillSwitchButton />
            <WalletConnect />
            <AlertSystem />
          </div>
        </header>
        <CommandPalette />

        <main>
          <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh] text-muted text-sm uppercase tracking-widest">Loading…</div>}>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/transparency" element={<TransparencyPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/performance" element={<PerformancePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;
