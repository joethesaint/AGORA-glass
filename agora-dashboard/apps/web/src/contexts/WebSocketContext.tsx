import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import type { WebSocketEvent, DashboardState } from '@/types/events';
import { WEBSOCKET_URL, WEBSOCKET_RECONNECT_DELAY, WEBSOCKET_MAX_RETRIES } from '@/lib/constants';
import { toast } from 'sonner';

interface WebSocketContextType extends DashboardState {
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<DashboardState['currentPosition']>(null);
  const [latestRiskVerdict, setLatestRiskVerdict] = useState<DashboardState['latestRiskVerdict']>(null);
  const [latestReasoningTrace, setLatestReasoningTrace] = useState<DashboardState['latestReasoningTrace']>(null);
  const [rescueHistory, setRescueHistory] = useState<DashboardState['rescueHistory']>([]);
  const [positionHistory, setPositionHistory] = useState<DashboardState['positionHistory']>([]);
  const [volatility, setVolatility] = useState<DashboardState['volatility']>({});

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const message: WebSocketEvent = JSON.parse(event.data);

      switch (message.type) {
        case 'PositionUpdate':
          setCurrentPosition(message.data);
          setPositionHistory((prev) => {
            const updated = [...prev, message.data];
            return updated.slice(-50);
          });
          break;

        case 'RiskVerdict':
          setLatestRiskVerdict(message.data);
          break;

        case 'ReasoningTrace':
          setLatestReasoningTrace(message.data);
          break;

        case 'RescueComplete':
          setRescueHistory((prev) => {
            const updated = [message.data, ...prev];
            return updated.slice(0, 50);
          });
          
          if (message.data.status === 'SUCCESS') {
            toast.success('Rescue operation successful', {
              description: `$${message.data.amount.toFixed(2)} USDC deposited`,
            });
          } else {
            toast.error('Rescue operation failed', {
              description: 'Check rescue feed for details',
            });
          }
          break;

        case 'MarketVolatilityUpdate':
          setVolatility((prev) => ({
            ...prev,
            [message.data.symbol]: message.data.volatility_factor,
          }));
          break;

        default:
          console.warn('Unknown message type:', message);
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    try {
      const ws = new WebSocket(WEBSOCKET_URL);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
        toast.success('Connected to agent', {
          description: 'Real-time monitoring active',
        });
      };

      ws.onmessage = handleMessage;

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        wsRef.current = null;

        if (reconnectAttemptsRef.current < WEBSOCKET_MAX_RETRIES) {
          reconnectAttemptsRef.current += 1;
          console.log(`Reconnecting... (attempt ${reconnectAttemptsRef.current}/${WEBSOCKET_MAX_RETRIES})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, WEBSOCKET_RECONNECT_DELAY);
        } else {
          console.error('Max reconnection attempts reached');
          toast.error('Connection lost', {
            description: 'Unable to reconnect to agent. Please check if the Python agent is running.',
          });
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }, [handleMessage]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
    reconnectAttemptsRef.current = 0;
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttemptsRef.current = 0;
    setTimeout(connect, 100);
  }, [connect, disconnect]);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  const value: WebSocketContextType = {
    isConnected,
    currentPosition,
    latestRiskVerdict,
    latestReasoningTrace,
    rescueHistory,
    positionHistory,
    volatility,
    connect,
    disconnect,
    reconnect,
  };

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
}

export function useWebSocketData() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocketData must be used within a WebSocketProvider');
  }
  return context;
}
