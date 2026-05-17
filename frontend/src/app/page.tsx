'use client';

import { useAgentSignals } from '../hooks/useAgentSignals';
import { PositionCard } from '../components/PositionCard';
import { ReasoningTraceCard } from '../components/ReasoningTraceCard';

export default function Home() {
  const { signals, status } = useAgentSignals();

  // Helper to find the latest of a certain type
  const getLatestSignal = (type: string) => signals.find(s => s.event_type === type);

  const latestPosition = getLatestSignal('PositionUpdate')?.payload;
  const latestVerdict = getLatestSignal('RiskVerdict')?.payload;
  const latestTrace = getLatestSignal('ReasoningTrace')?.payload;

  return (
    <main className="min-h-screen p-8 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tighter">AGORA-glass Sentinel</h1>
        <div className={`px-4 py-1 rounded-full text-sm font-medium ${status === 'connected' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'}`}>
          {status.toUpperCase()}
        </div>
      </header>
      
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Status & Position */}
        <div className="lg:col-span-1 space-y-6">
          {latestPosition && <PositionCard data={latestPosition} />}
          
          {latestVerdict && (
            <div className={`p-6 rounded-xl shadow-sm border ${latestVerdict.status === 'CRITICAL' ? 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'}`}>
              <h2 className="text-sm font-semibold text-zinc-500 mb-2">Risk Status</h2>
              <p className={`text-4xl font-black ${latestVerdict.status === 'CRITICAL' ? 'text-red-600 dark:text-red-400' : 'text-green-600'}`}>
                {latestVerdict.status}
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Reasoning & History */}
        <div className="lg:col-span-2">
          {latestTrace && <ReasoningTraceCard data={latestTrace} />}
          
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Event Log</h2>
            <div className="h-[400px] overflow-y-auto space-y-2 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 bg-white dark:bg-zinc-900">
                {signals.map((s, i) => (
                    <div key={i} className="text-xs font-mono p-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                        <span className="text-zinc-400 mr-2">[{new Date(s.timestamp).toLocaleTimeString()}]</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400 mr-2">{s.event_type}</span>
                        <span className="text-zinc-700 dark:text-zinc-300">{JSON.stringify(s.payload || {}).substring(0, 80)}...</span>
                    </div>
                ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
