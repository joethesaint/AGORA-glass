import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendWebSocketSignal } from '@/hooks/useAgentSignals';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  if (!open) return null;

  const commands = [
    { type: 'route', id: '/', label: 'Go to Dashboard' },
    { type: 'route', id: '/transparency', label: 'Go to Transparency' },
    { type: 'route', id: '/analytics', label: 'Go to Analytics' },
    { type: 'action', id: 'KILL_SWITCH', label: '⚠ Trip Kill-Switch (De-risk ALL)' },
    { type: 'action', id: 'TOGGLE_MODE_SENTINEL', label: '🛡️ Switch to Sentinel Mode' },
    { type: 'action', id: 'TOGGLE_MODE_TRADING', label: '📈 Switch to Trading Mode' }
  ];

  const filtered = commands.filter(c => c.label.toLowerCase().includes(q.toLowerCase()));

  const executeCommand = (cmd: typeof commands[0]) => {
    if (cmd.type === 'route') {
      navigate(cmd.id);
    } else if (cmd.type === 'action') {
      if (cmd.id.startsWith('TOGGLE_MODE_')) {
        const mode = cmd.id.split('_')[2].toLowerCase();
        sendWebSocketSignal('TOGGLE_MODE', { mode });
      } else {
        sendWebSocketSignal(cmd.id, {});
      }
    }
    setOpen(false);
    setQ('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-[#000000]/60 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div 
        className="w-full max-w-[560px] bg-[#0B0E14] border border-[#1E2532] shadow-2xl overflow-hidden rounded flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3 border-b border-[#1E2532]">
          <input 
            autoFocus
            className="w-full bg-transparent outline-none text-sm text-[#F2F2F2] placeholder:text-muted font-sans"
            placeholder="Type a command or search (e.g. 'Kill')..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="max-h-[50vh] overflow-y-auto">
          {filtered.map((c, i) => (
            <button 
              key={i} 
              className="w-full text-left px-4 py-3 text-sm text-[#E2E8F0] hover:bg-[#1E2532] transition-colors border-b border-[#1E2532]/50 last:border-0"
              onClick={() => executeCommand(c)}
            >
              {c.label}
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="px-4 py-6 text-sm text-center text-muted">No matches found.</div>
          )}
        </div>
        <div className="px-4 py-2 border-t border-[#1E2532] bg-[#0B0E14] flex gap-4 text-[10px] text-muted uppercase tracking-wider font-mono">
          <span>↵ SELECT</span>
          <span>esc CLOSE</span>
        </div>
      </div>
    </div>
  );
}