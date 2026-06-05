import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAnalyticsStore } from '@/stores/analyticsStore';
import { Play, ShieldAlert } from 'lucide-react';

export const CommandBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedSymbol, setSelectedSymbol, livePositions } = useAnalyticsStore();

  const [localSecurity, setLocalSecurity] = useState<string>('ALL');
  const [localFunction, setLocalFunction] = useState<string>('DASHBOARD');
  const [previewText, setPreviewText] = useState<string>('Ready');

  // Map route pathnames to terminal functions
  const pathToFunc: Record<string, string> = {
    '/': 'DASHBOARD',
    '/transparency': 'TRANSPARENCY',
    '/analytics': 'ANALYTICS',
    '/performance': 'PERFORMANCE',
    '/about': 'ABOUT',
    '/settings': 'SETTINGS',
  };

  const funcToPath: Record<string, string> = {
    DASHBOARD: '/',
    TRANSPARENCY: '/transparency',
    ANALYTICS: '/analytics',
    PERFORMANCE: '/performance',
    ABOUT: '/about',
    SETTINGS: '/settings',
  };

  // Sync state with url and store
  useEffect(() => {
    const currentFunc = pathToFunc[location.pathname] || 'DASHBOARD';
    setLocalFunction(currentFunc);
  }, [location.pathname]);

  useEffect(() => {
    if (selectedSymbol) {
      setLocalSecurity(selectedSymbol);
    } else {
      setLocalSecurity('ALL');
    }
  }, [selectedSymbol]);

  // Extract actual unique symbols from positions plus some defaults
  const symbols = ['ALL', 'BTC-PERP', 'ETH-PERP', 'SOL-PERP', 'ARB-PERP', 'TIA-PERP'];

  const handleGo = () => {
    setPreviewText('Executing...');
    
    // 1. Handle Security Focus
    if (localSecurity === 'ALL') {
      setSelectedSymbol(null);
    } else {
      setSelectedSymbol(localSecurity);
    }

    // 2. Handle Function Routing
    const targetPath = funcToPath[localFunction];
    if (targetPath && location.pathname !== targetPath) {
      navigate(targetPath);
    }

    setTimeout(() => {
      setPreviewText(`LOADED: ${localSecurity} // ${localFunction}`);
    }, 300);
  };

  // Handle Enter keypress for command execution
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleGo();
    }
  };

  return (
    <div 
      className="flex flex-wrap items-center gap-3 bg-[#0B0D10] border border-[#1E2532] p-1.5 px-3 rounded-lg text-xs font-mono select-none"
      onKeyDown={handleKeyDown}
    >
      {/* Security Selector */}
      <div className="flex items-center gap-1.5">
        <label className="text-[9px] uppercase tracking-wider text-[#8A93A3] font-bold">Security</label>
        <select
          value={localSecurity}
          onChange={(e) => setLocalSecurity(e.target.value)}
          className="terminal-dropdown min-w-[90px]"
        >
          {symbols.map((sym) => (
            <option key={sym} value={sym}>
              {sym}
            </option>
          ))}
        </select>
      </div>

      <div className="hidden sm:block w-px h-5 bg-white/10" />

      {/* Function Selector */}
      <div className="flex items-center gap-1.5">
        <label className="text-[9px] uppercase tracking-wider text-[#8A93A3] font-bold">Function</label>
        <select
          value={localFunction}
          onChange={(e) => setLocalFunction(e.target.value)}
          className="terminal-dropdown min-w-[120px]"
        >
          <option value="DASHBOARD">avb // RISK PANEL</option>
          <option value="TRANSPARENCY">briefing // AUDIT</option>
          <option value="ANALYTICS">radar // ANALYTICS</option>
          <option value="PERFORMANCE">fractal // HISTORIC</option>
          <option value="ABOUT">home // PROTOCOL</option>
          <option value="SETTINGS">options // CONFIG</option>
        </select>
      </div>

      {/* GO Button */}
      <button
        onClick={handleGo}
        className="terminal-go-btn flex items-center gap-1 uppercase"
        title="Execute command"
      >
        <Play size={8} fill="currentColor" />
        <span>GO</span>
      </button>

      <div className="hidden md:block w-px h-5 bg-white/10" />

      {/* Bloomberg-Style Status Panel */}
      <div className="hidden md:flex items-center gap-2 text-[10px] text-[#484848] max-w-[180px] truncate">
        <span className={previewText.startsWith('LOADED') ? 'text-[#00F3FF]' : 'text-[#8A93A3]'}>
          {previewText}
        </span>
      </div>
    </div>
  );
};
