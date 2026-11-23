export function DemoBanner() {
  return (
    <div className="w-full bg-warn/15 border-b border-warn/40 text-foreground text-xs sm:text-sm px-4 py-2 text-center">
      <strong>Demo.</strong> This replays a recorded run of the agent on simulated positions. No real funds, no live
      chain calls.{' '}
      <a
        className="underline hover:opacity-80"
        href="https://github.com/joethesaint/AGORA-glass#run-it"
        target="_blank"
        rel="noreferrer"
      >
        Run it yourself
      </a>
    </div>
  );
}
