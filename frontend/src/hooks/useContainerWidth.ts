import { useEffect, useRef, useState } from 'react';

/**
 * Tracks an element's width with a single ResizeObserver, for passing a real
 * pixel width to recharts' <LineChart>/<AreaChart> instead of wrapping them
 * in <ResponsiveContainer>. ResponsiveContainer re-measures (getBoundingClientRect)
 * far more often than an actual layout change requires — this only updates
 * state when the width genuinely changes by a meaningful amount.
 */
export function useContainerWidth<T extends HTMLElement>(defaultWidth = 560) {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(defaultWidth);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // ResizeObserver dispatches an initial callback as soon as observation
    // starts (per spec), so no separate manual measure-on-mount call is
    // needed — that would just cost an extra render for the same value.
    const ro = new ResizeObserver((entries) => {
      const w = Math.round(entries[0].contentRect.width);
      if (w > 0) setWidth((prev) => (Math.abs(prev - w) > 2 ? w : prev));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return { ref, width };
}
