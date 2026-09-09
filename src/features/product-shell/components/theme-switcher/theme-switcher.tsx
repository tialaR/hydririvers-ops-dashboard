'use client';

import { Moon, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTheme } from '@/shared/providers/theme-provider';

import styles from './theme-switcher.module.sass';

export function ThemeSwitcher() {
  const t = useTranslations('shipperMobileFlow.theme');
  const { theme, setTheme } = useTheme();
  const next = theme === 'dark' ? 'light' : 'dark';

  return (
    <button
      type="button"
      className={styles.button}
      aria-label={t('toggle')}
      onClick={() => setTheme(next)}
    >
      {theme === 'dark' ? <Sun size={18} aria-hidden /> : <Moon size={18} aria-hidden />}
    </button>
  );
}
