import { create } from 'zustand';
// ethers is only needed inside connect()'s web3 branch, but this store is
// used unconditionally from App.tsx's very first render — a static import
// here would ship the whole library in the initial bundle regardless of
// whether a visitor ever clicks "connect wallet". Loaded dynamically instead.

interface OnboardingData {
  account: string;
  vaultAmount: string;
  isMock: boolean;
}

interface WalletState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  isModalOpen: boolean;
  connectionType: 'web2' | 'web3' | null;
  chain: string | null;
  balance: string;
  connect: (type: 'web2' | 'web3') => Promise<void>;
  disconnect: () => void;
  setIsModalOpen: (isOpen: boolean) => void;
  isOnboarded: boolean;
  setOnboarded: (status: boolean) => void;
  onboardingData: OnboardingData | null;
  setOnboardingData: (data: OnboardingData | null) => void;
}

const isClient = typeof window !== 'undefined';

export const useWalletStore = create<WalletState>((set, get) => ({
  address: process.env.NODE_ENV === 'development' ? '0xDevMockAddress' : null,
  isConnected: process.env.NODE_ENV === 'development',
  isConnecting: false,
  isModalOpen: false,
  connectionType: process.env.NODE_ENV === 'development' ? 'web2' : null,
  chain: process.env.NODE_ENV === 'development' ? 'Arc Testnet (Dev)' : null,
  balance: process.env.NODE_ENV === 'development' ? '10000.00' : '0.00',
  isOnboarded: isClient ? localStorage.getItem('glass-onboarded') === 'true' : false,
  setOnboarded: (status) => {
    if (isClient) {
      localStorage.setItem('glass-onboarded', String(status));
    }
    set({ isOnboarded: status });
  },
  onboardingData: (() => {
    if (!isClient) return null;
    const raw = localStorage.getItem('glass-onboarding-data');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  })(),
  setOnboardingData: (data) => {
    if (isClient) {
      if (data) {
        localStorage.setItem('glass-onboarding-data', JSON.stringify(data));
      } else {
        localStorage.removeItem('glass-onboarding-data');
      }
    }
    set({ onboardingData: data });
  },
  setIsModalOpen: (isOpen) => set({ isModalOpen: isOpen }),
  connect: async (type: 'web2' | 'web3') => {
    // In development, auto‑connect mock wallet instantly UNLESS a real Web3 wallet is requested and available
    const hasEthereum = typeof window !== 'undefined' && !!(window as any).ethereum;
    if (process.env.NODE_ENV === 'development' && !(type === 'web3' && hasEthereum)) {
      console.log('🛡️ GLASS: Dev mode auto‑connect wallet');
      set({
        address: '0xDevMockAddress',
        isConnected: true,
        isConnecting: false,
        isModalOpen: false,
        connectionType: type,
        chain: 'Arc Testnet (Dev)',
        balance: '10,000.00',
      });
      return;
    }
    set({ isConnecting: true, connectionType: type });
    
    try {
      if (type === 'web3') {
        if (typeof window !== 'undefined' && (window as any).ethereum) {
          const { ethers } = await import('ethers');
          const provider = new ethers.BrowserProvider((window as any).ethereum);
          const accounts = await provider.send("eth_requestAccounts", []);
          const address = accounts[0];
          const balance = await provider.getBalance(address);
          const network = await provider.getNetwork();

          set({
            address,
            isConnected: true,
            isConnecting: false,
            isModalOpen: false,
            chain: network.name === 'unknown' ? 'Arc Testnet' : network.name,
            balance: parseFloat(ethers.formatEther(balance)).toFixed(4),
          });
        } else {
          // Fallback for Demo/Mock mode when no wallet is installed
          console.warn('🛡️ GLASS: No Web3 wallet found, falling back to Mock Native');
          await new Promise((resolve) => setTimeout(resolve, 1000));
          set({
            address: '0xWeb3Native_Mock_35Cc...844e',
            isConnected: true,
            isConnecting: false,
            isModalOpen: false,
            chain: 'Arc Testnet (Simulated)',
            balance: '12,450.00',
          });
        }
      } else {
        // Web2 / Circle Simulation (or real implementation if SDK available)
        await new Promise((resolve) => setTimeout(resolve, 1500));
        set({
          address: '0xCircleUser_742d...f44e',
          isConnected: true,
          isConnecting: false,
          isModalOpen: false,
          chain: 'Arc Testnet',
          balance: '5,000.00',
        });
      }
    } catch (err) {
      console.error('🛡️ GLASS: Connection failed', err);
      set({ isConnecting: false });
      alert(err instanceof Error ? err.message : "Connection failed");
    }
  },
  disconnect: () => {
    set({
      address: null,
      isConnected: false,
      isConnecting: false,
      connectionType: null,
      chain: null,
      balance: '0.00',
    });
  },
}));
