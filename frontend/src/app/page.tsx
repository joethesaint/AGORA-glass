'use client';

import { useAgentSignals } from '../hooks/useAgentSignals';

export default function Home() {
  const { signals, status } = useAgentSignals();

  return (
    <main className="min-h-screen p-8 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tighter">AGORA-glass Sentinel</h1>
        <div className={`px-4 py-1 rounded-full text-sm font-medium ${status === 'connected' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'}`}>
          {status.toUpperCase()}
        </div>
      </header>
      
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-semibold mb-4">Live Signals</h2>
          <div className="max-h-[500px] overflow-y-auto space-y-3">
            {signals.map((s, i) => (
              <div key={i} className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-xs font-mono">
                <div className="flex justify-between mb-1 text-zinc-500">
                    <span>{s.event_type}</span>
                    <span>{new Date(s.timestamp).toLocaleTimeString()}</span>
                </div>
                <pre className="whitespace-pre-wrap">{JSON.stringify(s.payload, null, 2)}</pre>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
