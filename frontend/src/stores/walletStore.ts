import { create } from 'zustand';
import { ethers } from 'ethers';

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
}

export const useWalletStore = create<WalletState>((set, get) => ({
  address: process.env.NODE_ENV === 'development' ? '0xDevMockAddress' : null,
  isConnected: process.env.NODE_ENV === 'development',
  isConnecting: false,
  isModalOpen: false,
  connectionType: process.env.NODE_ENV === 'development' ? 'web2' : null,
  chain: process.env.NODE_ENV === 'development' ? 'Arc Testnet (Dev)' : null,
  balance: process.env.NODE_ENV === 'development' ? '10000.00' : '0.00',
  isOnboarded: false,
  setOnboarded: (status) => set({ isOnboarded: status }),
  setIsModalOpen: (isOpen) => set({ isModalOpen: isOpen }),
  connect: async (type: 'web2' | 'web3') => {
    // In development, auto‑connect mock wallet instantly
    if (process.env.NODE_ENV === 'development') {
      console.log('🛡️ GLASS: Dev mode auto‑connect wallet');
      set({
        address: '0xDevMockAddress',
        isConnected: true,
        isConnecting: false,
        isModalOpen: false,
        connectionType: type,
        chain: 'Arc Testnet (Dev)',
        balance: '10000.00',
      });
      return;
    }
    set({ isConnecting: true, connectionType: type });
    
    try {
      if (type === 'web3') {
        if (typeof window !== 'undefined' && (window as any).ethereum) {
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
