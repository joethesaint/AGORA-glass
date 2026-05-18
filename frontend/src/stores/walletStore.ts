import { create } from 'zustand';

interface WalletState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  connectionType: 'web2' | 'web3' | null;
  chain: string | null;
  balance: string;
  connect: (type: 'web2' | 'web3') => Promise<void>;
  disconnect: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  address: null,
  isConnected: false,
  isConnecting: false,
  connectionType: null,
  chain: null,
  balance: '0.00',
  connect: async (type: 'web2' | 'web3') => {
    set({ isConnecting: true, connectionType: type });
    // Simulate wallet connection delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const mockAddress = type === 'web2' 
      ? '0xCircleUser_742d...f44e' 
      : '0xWeb3Native_35Cc...844e';

    set({
      address: mockAddress,
      isConnected: true,
      isConnecting: false,
      chain: 'Arc Testnet',
      balance: type === 'web2' ? '5,000.00' : '12,450.00',
    });
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
