export interface ReasoningTrace {
  agent_id: string;
  action: string;
  account: string;
  leverage_before: number;
  margin_ratio: number;
  rescue_amount_usdc: number;
  evidence: string[];
  risk_rating: string;
  reason_hash: string;
  reasoning_text: string;
}

export function ReasoningTraceCard({ data }: { data: ReasoningTrace }) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm mt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold">Glass-Box Reasoning Trace</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${data.risk_rating === 'CRITICAL' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-black'}`}>
          {data.risk_rating}
        </span>
      </div>
      
      <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-4">{data.reasoning_text}</p>
      
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-zinc-500">Evidence</h4>
        <ul className="text-xs text-zinc-400 list-disc list-inside">
            {data.evidence.map((e, i) => <li key={i}>{e}</li>)}
        </ul>
      </div>
      
      <div className="mt-4 p-2 bg-zinc-100 dark:bg-zinc-800 rounded font-mono text-[10px] text-zinc-500 break-all">
        Hash: {data.reason_hash}
      </div>
    </div>
  );
}
