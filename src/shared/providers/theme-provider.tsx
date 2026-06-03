'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { persistStoredTheme, type StoredTheme } from '@/shared/preferences/client-preferences';

export type Theme = StoredTheme;

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isTheme(value: string | null | undefined): value is Theme {
  return value === 'light' || value === 'dark';
}

function syncTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

export function ThemeProvider({
  children,
  initialTheme
}: {
  children: ReactNode;
  initialTheme: Theme;
}) {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    syncTheme(theme);
    persistStoredTheme(theme);
  }, [theme]);

  useEffect(() => {
    const onThemeChange = (event: Event) => {
      const nextTheme = (event as CustomEvent<Theme>).detail;
      if (!isTheme(nextTheme)) return;
      setTheme(nextTheme);
    };
    window.addEventListener('hydrorivers:theme-change', onThemeChange);
    return () => window.removeEventListener('hydrorivers:theme-change', onThemeChange);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div data-hydro-theme={theme}>{children}</div>
    </ThemeContext.Provider>
  );
}
