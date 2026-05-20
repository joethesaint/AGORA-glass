import { useWebSocketData } from '@/contexts/WebSocketContext';
import { Button } from '@workspace/ui/components/button';

export function ConnectionStatus() {
  const { isConnected, reconnect } = useWebSocketData();

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <div
          className={`h-2 w-2 rounded-full ${
            isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
          }`}
        />
        <span className="text-sm font-medium">
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
      {!isConnected && (
        <Button variant="outline" size="sm" onClick={reconnect}>
          Reconnect
        </Button>
      )}
    </div>
  );
}
