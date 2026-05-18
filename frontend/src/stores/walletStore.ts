import { create } from 'zustand';

interface WalletState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  chain: string | null;
  balance: string;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  address: null,
  isConnected: false,
  isConnecting: false,
  chain: null,
  balance: '0.00',
  connect: async () => {
    set({ isConnecting: true });
    // Simulate wallet connection delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    set({
      address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      isConnected: true,
      isConnecting: false,
      chain: 'Arc Testnet',
      balance: '12,450.00',
    });
  },
  disconnect: () => {
    set({
      address: null,
      isConnected: false,
      isConnecting: false,
      chain: null,
      balance: '0.00',
    });
  },
}));
