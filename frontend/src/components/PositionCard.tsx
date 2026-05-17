export interface PositionUpdate {
  symbol: string;
  margin_ratio: number;
  leverage: number;
  account: string;
}

export function PositionCard({ data }: { data: PositionUpdate }) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-zinc-500">Position Health</h3>
        <span className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">{data.symbol}</span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-zinc-500">Margin Ratio</p>
          <p className="text-lg font-bold">{(data.margin_ratio * 100).toFixed(2)}%</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">Leverage</p>
          <p className="text-lg font-bold">{data.leverage.toFixed(1)}x</p>
        </div>
      </div>
      <p className="text-[10px] text-zinc-400 mt-3 truncate">{data.account}</p>
    </div>
  );
}
