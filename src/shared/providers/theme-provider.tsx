'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { persistStoredTheme, readStoredTheme, type StoredTheme } from '@/shared/preferences/client-preferences';

export type Theme = StoredTheme;

function isTheme(value: string | null | undefined): value is Theme {
  return value === 'light' || value === 'dark';
}

function readClientThemeFallback(defaultTheme: Theme): Theme {
  return readStoredTheme(defaultTheme);
}

function syncTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export function ThemeProvider({
  children,
  initialTheme
}: {
  children: ReactNode;
  initialTheme: Theme;
}) {
  const [theme, setTheme] = useState<Theme>(() => readClientThemeFallback(initialTheme));

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

  return <div data-hydro-theme={theme}>{children}</div>;
}
