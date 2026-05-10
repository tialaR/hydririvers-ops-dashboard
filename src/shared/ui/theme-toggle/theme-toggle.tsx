'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';
import { persistStoredTheme, readStoredTheme } from '@/shared/preferences/client-preferences';
import { HydroIcon } from '@/shared/ui/hydro-icon/hydro-icon';
import styles from './theme-toggle.module.scss';

type Theme = 'light' | 'dark';
type ThemeToggleVariant = 'icon' | 'pill';

const defaultThemeLabels = {
  light: 'lightMode',
  dark: 'darkMode'
} as const;

type ThemeToggleProps = {
  ariaLabel?: string;
  variant?: ThemeToggleVariant;
};

function resolveTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  const fromDom = document.documentElement.dataset.theme;
  if (fromDom === 'light' || fromDom === 'dark') return fromDom;
  const stored = readStoredTheme('dark');
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function ThemeToggle({ ariaLabel, variant = 'icon' }: ThemeToggleProps) {
  const t = useTranslations('common');
  const [theme, setTheme] = useState<Theme>(() => resolveTheme());
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useEffect(() => {
    const onThemeChange = (event: Event) => {
      const nextTheme = (event as CustomEvent<Theme>).detail;
      if (nextTheme === 'light' || nextTheme === 'dark') {
        setTheme(nextTheme);
      }
    };
    window.addEventListener('hydrorivers:theme-change', onThemeChange);
    return () => window.removeEventListener('hydrorivers:theme-change', onThemeChange);
  }, []);

  function toggleTheme() {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    persistStoredTheme(nextTheme);
    window.dispatchEvent(new CustomEvent('hydrorivers:theme-change', { detail: nextTheme }));
    setTheme(nextTheme);
  }

  const currentIcon = mounted && theme === 'light' ? 'sun' : 'moon';
  const themeLabel = theme === 'light' ? t('lightMode') : t('darkMode');

  if (variant === 'pill') {
    return (
      <button
        className={styles.pill}
        onClick={toggleTheme}
        aria-label={ariaLabel ?? `${t('toggleTheme')} • ${themeLabel}`}
        aria-pressed={theme === 'dark'}
        title={themeLabel}
        data-mode={theme}
        data-variant="pill"
        type="button"
      >
        <span className={theme === 'light' ? styles.iconActive : styles.iconInactive} aria-hidden>
          <HydroIcon name="sun" size={16} />
        </span>
        <span className={theme === 'dark' ? styles.iconActive : styles.iconInactive} aria-hidden>
          <HydroIcon name="moon" size={16} />
        </span>
      </button>
    );
  }

  return (
    <button
      className={styles.button}
      onClick={toggleTheme}
      aria-label={ariaLabel ?? `${t('toggleTheme')} • ${themeLabel}`}
      aria-pressed={theme === 'dark'}
      title={themeLabel}
      data-mode={theme}
      data-variant="icon"
      type="button"
    >
      <HydroIcon name={currentIcon} size={18} />
    </button>
  );
}
