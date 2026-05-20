import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { W3SSdk } from '@circle-fin/w3s-pw-web-sdk';
import { CIRCLE_APP_ID } from '@/lib/constants';

interface WalletContextType {
  sdk: W3SSdk | null;
  isInitialized: boolean;
  isConnected: boolean;
  userToken: string | null;
  encryptionKey: string | null;
  walletAddress: string | null;
  error: string | null;
  initializeSDK: (appId: string) => void;
  setAuthentication: (userToken: string, encryptionKey: string) => void;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [sdk, setSdk] = useState<W3SSdk | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [encryptionKey, setEncryptionKey] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const initializeSDK = useCallback((appId: string) => {
    try {
      const newSdk = new W3SSdk();
      
      // Set app settings after initialization
      newSdk.setAppSettings({
        appId: appId || CIRCLE_APP_ID,
      });

      setSdk(newSdk);
      setIsInitialized(true);
      setError(null);
    } catch (err) {
      setError(`SDK Initialization Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsInitialized(false);
    }
  }, []);

  const setAuthenticationHandler = useCallback((token: string, key: string) => {
    if (!sdk) {
      setError('SDK not initialized');
      return;
    }

    try {
      sdk.setAuthentication({
        userToken: token,
        encryptionKey: key,
      });

      setUserToken(token);
      setEncryptionKey(key);
      setIsConnected(true);
      setError(null);

      // Store in localStorage
      localStorage.setItem('circle_user_token', token);
      localStorage.setItem('circle_encryption_key', key);
    } catch (err) {
      setError(`Authentication Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsConnected(false);
    }
  }, [sdk]);

  const disconnect = useCallback(() => {
    setUserToken(null);
    setEncryptionKey(null);
    setWalletAddress(null);
    setIsConnected(false);
    
    // Clear localStorage
    localStorage.removeItem('circle_user_token');
    localStorage.removeItem('circle_encryption_key');
    localStorage.removeItem('wallet_address');
  }, []);

  // Initialize SDK on mount if CIRCLE_APP_ID is available
  useEffect(() => {
    if (CIRCLE_APP_ID && !isInitialized) {
      initializeSDK(CIRCLE_APP_ID);
    }
  }, [CIRCLE_APP_ID, isInitialized, initializeSDK]);

  // Restore session from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('circle_user_token');
    const storedKey = localStorage.getItem('circle_encryption_key');
    const storedAddress = localStorage.getItem('wallet_address');

    if (storedToken && storedKey && sdk) {
      setAuthenticationHandler(storedToken, storedKey);
    }

    if (storedAddress) {
      setWalletAddress(storedAddress);
    }
  }, [sdk, setAuthenticationHandler]);

  const value: WalletContextType = {
    sdk,
    isInitialized,
    isConnected,
    userToken,
    encryptionKey,
    walletAddress,
    error,
    initializeSDK,
    setAuthentication: setAuthenticationHandler,
    disconnect,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
