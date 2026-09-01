import { useState } from 'react';
import { sendWebSocketSignal } from '@/hooks/useAgentSignals';
import { AlertTriangle } from 'lucide-react';

export function KillSwitchButton() {
  const [armed, setArmed] = useState(false);

  const handleToggle = () => {
    if (!armed) {
      setArmed(true);
      sendWebSocketSignal('KILL_SWITCH', {});
    } else {
      setArmed(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-sm border text-[11px] font-bold tracking-widest uppercase transition-all ${armed ? 'bg-[#FF3B30]/20 border-[#FF3B30] text-[#FF3B30] animate-pulse' : 'bg-[#0B0E14] border-[#1E2532] text-muted hover:border-[#FF3B30]/50 hover:text-[#FF3B30]'}`}
    >
      <AlertTriangle size={14} className={armed ? "text-[#FF3B30]" : ""} />
      {armed ? 'KILL ARMED' : 'KILL SWITCH'}
    </button>
  );
}
