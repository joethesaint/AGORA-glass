import { useEffect } from 'react';
import { useThemeStore } from '@/stores/themeStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // themeStore applies data-theme on module load (and index.html's inline
  // script does it before that, to avoid a flash) — this just keeps the
  // accent-color override in sync, same as before.
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
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

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return <>{children}</>;
}
