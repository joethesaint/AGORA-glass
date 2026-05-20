'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Server, Settings, Zap } from 'lucide-react';

export const StrategyControlPanel = () => {
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
    <motion.div 
      className="border border-[#1e1e1e] bg-[#0c0c0c] rounded-2xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
          <Settings className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-medium text-white">Strategy Control Panel</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs text-[#787878] uppercase tracking-widest mb-2 block">Sentinel "Brain" Mode</label>
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleToggle}
              disabled={loading}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                isRemote 
                  ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                  : 'bg-[#1e1e1e] hover:bg-[#2a2a2a] text-[#8A93A3]'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>{isRemote ? 'Remote Agent Enabled' : 'Local Safety Bands Active'}</span>
            </button>
          </div>
        </div>

        {isRemote && (
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <label className="text-xs text-[#787878] uppercase tracking-widest block">Remote Agent API URL</label>
            <input 
              type="text"
              value={remoteUrl}
              onChange={(e) => setRemoteUrl(e.target.value)}
              placeholder="http://your-agent-api.com"
              className="w-full bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg px-4 py-2 text-sm text-white placeholder-[#484848] focus:outline-none focus:border-purple-500"
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
