// Demo mode: replays a recorded run of the Python agent instead of opening a
// WebSocket. Used for the hosted dashboard, where no agent is running.
//
// The recording (public/demo/recording.jsonl) is the agent's own WebSocket
// output in mock mode: every message as it was sent, with `t` = seconds since
// the recording started. Timestamps are shifted to "now" so charts look live,
// and the run loops.

type Recorded = { t: number; m: any };

export const DEMO_MODE: boolean =
  import.meta.env.VITE_DEMO_MODE === 'true' ||
  (typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('demo'));

const RECORDING_URL = `${import.meta.env.BASE_URL}demo/recording.jsonl`;

function shiftTimestamps(value: any, delta: number): any {
  if (Array.isArray(value)) {
    // INITIAL_HISTORY series are [timestamp, value] pairs
    if (value.length === 2 && typeof value[0] === 'number' && typeof value[1] === 'number' && value[0] > 1e9) {
      return [value[0] + delta, value[1]];
    }
    return value.map((v) => shiftTimestamps(v, delta));
  }
  if (value && typeof value === 'object') {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = k === 'timestamp' && typeof v === 'number' ? v + delta : shiftTimestamps(v, delta);
    }
    return out;
  }
  return value;
}

function firstTimestamp(rows: Recorded[]): number {
  for (const r of rows) {
    if (typeof r.m?.timestamp === 'number') return r.m.timestamp - r.t;
  }
  return Date.now() / 1000;
}

/** Starts the replay. Returns a stop function. */
export function startDemoReplay(push: (raw: any) => void, onError: (err: unknown) => void): () => void {
  let stopped = false;
  const timers: ReturnType<typeof setTimeout>[] = [];

  const play = (rows: Recorded[]) => {
    if (stopped || rows.length === 0) return;
    const delta = Date.now() / 1000 - firstTimestamp(rows);
    for (const row of rows) {
      timers.push(setTimeout(() => !stopped && push(shiftTimestamps(row.m, delta)), row.t * 1000));
    }
    const last = rows[rows.length - 1].t;
    timers.push(setTimeout(() => play(rows), (last + 2) * 1000));
  };

  fetch(RECORDING_URL)
    .then((res) => {
      if (!res.ok) throw new Error(`recording: HTTP ${res.status}`);
      return res.text();
    })
    .then((text) => {
      const rows = text
        .split('\n')
        .filter((line) => line.trim())
        .map((line) => JSON.parse(line) as Recorded);
      play(rows);
    })
    .catch(onError);

  return () => {
    stopped = true;
    timers.forEach(clearTimeout);
  };
}
