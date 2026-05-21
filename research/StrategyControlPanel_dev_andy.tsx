import { useState } from 'react';
import { Settings, Zap } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';

export function StrategyControlPanel() {
  const [remoteUrl, setRemoteUrl] = useState('');
  const [isRemote, setIsRemote] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    // In a production app, we would send a websocket signal or API call
    // to update the sentinel's config dynamically.
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsRemote(!isRemote);
    setLoading(false);
  };

  return (
    <div className="border border-border bg-card rounded-2xl p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
          <Settings className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-medium">Strategy Control Panel</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-widest mb-2 block">
            Sentinel "Brain" Mode
          </label>
          <div className="flex items-center space-x-4">
            <Button 
              onClick={handleToggle}
              disabled={loading}
              variant={isRemote ? "default" : "outline"}
              className="flex items-center space-x-2"
            >
              <Zap className="w-4 h-4" />
              <span>{isRemote ? 'Remote Agent Enabled' : 'Local Safety Bands Active'}</span>
            </Button>
          </div>
        </div>

        {isRemote && (
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground uppercase tracking-widest block">
              Remote Agent API URL
            </label>
            <input 
              type="text"
              value={remoteUrl}
              onChange={(e) => setRemoteUrl(e.target.value)}
              placeholder="http://your-agent-api.com"
              className="w-full bg-background border border-input rounded-lg px-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        )}
      </div>
    </div>
  );
}
