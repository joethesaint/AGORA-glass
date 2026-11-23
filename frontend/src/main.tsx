import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { DEMO_MODE } from './demo/demoReplay';
import { useWalletStore } from './stores/walletStore';

// The hosted demo skips onboarding and watches the recorded mock account.
if (DEMO_MODE) {
  const wallet = useWalletStore.getState();
  wallet.setOnboardingData({ account: '0xMOCK', vaultAmount: '500', isMock: true });
  wallet.setOnboarded(true);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
