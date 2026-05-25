import { Routes, Route } from 'react-router-dom';
import { Navigation } from "@/components/Navigation";
import { AlertSystem } from "@/components/AlertSystem";
import { ThemeProvider } from "@/components/ThemeProvider";
import { WalletConnect } from "@/components/WalletConnect";

import { OnboardingWizard } from "@/components/OnboardingWizard";
import { useWalletStore } from "@/stores/walletStore";
import { useAgentSignals } from "@/hooks/useAgentSignals";

// Pages
import DashboardPage from "@/app/page";
import TransparencyPage from "@/app/transparency/page";
import AnalyticsPage from "@/app/analytics/page";
import PerformancePage from "@/app/performance/page";
import AboutPage from "@/app/about/page";
import SettingsPage from "@/app/settings/page";

import "./app/globals.css";

function App() {
  const { isOnboarded, setOnboarded } = useWalletStore();
  const { sendSignal } = useAgentSignals();

  if (!isOnboarded) {
    return (
      <ThemeProvider>
        <OnboardingWizard 
          onComplete={(data) => {
            console.log('🛡️ GLASS: Onboarding complete, sending config:', data);
            sendSignal('CONFIGURE_MONITORING', data);
            setOnboarded(true);
          }} 
        />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-[#0B0E14] text-[#F2F2F2] font-sans">
        <header className="flex justify-between items-center px-4 lg:px-6 py-4 border-b border-[#1E2532] sticky top-0 bg-[#0B0E14]/80 backdrop-blur-sm z-50">
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
              <span className="text-[9px] uppercase tracking-[0.2em] text-[#8A93A3] -mt-1 ml-0.5">
                by AGORA
              </span>
            </button>
            <Navigation />
          </div>
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] lg:text-[11px] text-[#8A93A3] uppercase">Unified Balance</p>
              <p className="text-base lg:text-xl font-bold text-[#00A3FF]">$12,450.00</p>
            </div>
            <WalletConnect />
            <AlertSystem />
          </div>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/transparency" element={<TransparencyPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/performance" element={<PerformancePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;
