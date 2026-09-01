import { create } from 'zustand';

export type Theme = 'glass' | 'terminal';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const isClient = typeof window !== 'undefined';

const readSavedTheme = (): Theme => {
  if (!isClient) return 'glass';
  try {
    const raw = localStorage.getItem('agora-settings');
    if (!raw) return 'glass';
    const settings = JSON.parse(raw);
    return settings?.appearance?.theme === 'terminal' ? 'terminal' : 'glass';
  } catch {
    return 'glass';
  }
};

const applyTheme = (theme: Theme) => {
  if (isClient) {
    document.documentElement.setAttribute('data-theme', theme);
  }
};

// Apply immediately on module load too (covers the case where index.html's
// inline anti-flash script didn't run, e.g. in tests).
const initialTheme = readSavedTheme();
applyTheme(initialTheme);

export const useThemeStore = create<ThemeState>((set) => ({
  theme: initialTheme,
  setTheme: (theme) => {
    applyTheme(theme);
    if (isClient) {
      try {
        const raw = localStorage.getItem('agora-settings');
        const settings = raw ? JSON.parse(raw) : {};
        settings.appearance = { ...settings.appearance, theme };
        localStorage.setItem('agora-settings', JSON.stringify(settings));
      } catch (e) {
        console.error('Failed to persist theme', e);
      }
    }
    set({ theme });
  },
}));
