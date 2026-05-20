'use client';

import { useEffect } from 'react';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem('agora-settings');
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        if (settings.appearance?.accentColor) {
          document.documentElement.style.setProperty('--accent', settings.appearance.accentColor);
        }
      } catch (e) {
        console.error('Failed to parse settings', e);
      }
    }
  }, []);

  return <>{children}</>;
}
