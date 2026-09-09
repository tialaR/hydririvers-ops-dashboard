'use client';

import { useTranslations } from 'next-intl';
import { persistStoredTheme } from '@/shared/preferences/client-preferences';
import { useTheme } from '@/shared/providers/theme-provider';
import { HydroIcon } from '@/shared/ui/hydro-icon/hydro-icon';
import styles from './theme-toggle.module.scss';

type ThemeToggleVariant = 'icon' | 'pill';

type ThemeToggleProps = {
  ariaLabel?: string;
  variant?: ThemeToggleVariant;
};

export function ThemeToggle({ ariaLabel, variant = 'icon' }: ThemeToggleProps) {
  const t = useTranslations('common');
  const { theme } = useTheme();

  function toggleTheme() {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    persistStoredTheme(nextTheme);
    window.dispatchEvent(new CustomEvent('hydrorivers:theme-change', { detail: nextTheme }));
  }

  const currentIcon = theme === 'light' ? 'sun' : 'moon';
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
