import { cookieNames } from '@/shared/http/cookie-names';
import { z } from 'zod';

export type StoredTheme = 'light' | 'dark';
export type StoredLocale = 'pt-BR' | 'en-US' | 'es';

export const storedThemeSchema = z.enum(['light', 'dark']);
export const storedLocaleSchema = z.enum(['pt-BR', 'en-US', 'es']);

const LEGACY_THEME_KEY = cookieNames.theme;
const MODERN_THEME_KEY = 'hydrorivers:theme';
const LEGACY_LOCALE_KEY = 'hydrorivers.locale';
const MODERN_LOCALE_KEY = 'hydrorivers:locale';

function readStorageValue(keys: string[]): string | null {
  if (typeof window === 'undefined') return null;

  for (const key of keys) {
    const value = window.localStorage.getItem(key);
    if (value) return value;
  }

  return null;
}

export function isStoredTheme(value: string | null | undefined): value is StoredTheme {
  return storedThemeSchema.safeParse(value).success;
}

export function readStoredTheme(defaultTheme: StoredTheme): StoredTheme {
  const stored = readStorageValue([MODERN_THEME_KEY, LEGACY_THEME_KEY]);
  const parsed = storedThemeSchema.safeParse(stored);
  return parsed.success ? parsed.data : defaultTheme;
}

export function persistStoredTheme(theme: StoredTheme) {
  try {
    window.localStorage.setItem(LEGACY_THEME_KEY, theme);
    window.localStorage.setItem(MODERN_THEME_KEY, theme);
    document.cookie = `${cookieNames.theme}=${theme}; path=/; max-age=31536000; SameSite=Lax`;
  } catch {
    /* ignore storage / cookie write failures */
  }
}

export function isStoredLocale(value: string | null | undefined): value is StoredLocale {
  return storedLocaleSchema.safeParse(value).success;
}

export function readStoredLocale(defaultLocale: StoredLocale): StoredLocale {
  const stored = readStorageValue([MODERN_LOCALE_KEY, LEGACY_LOCALE_KEY]);
  const parsed = storedLocaleSchema.safeParse(stored);
  return parsed.success ? parsed.data : defaultLocale;
}

export function persistStoredLocale(locale: StoredLocale) {
  try {
    window.localStorage.setItem(LEGACY_LOCALE_KEY, locale);
    window.localStorage.setItem(MODERN_LOCALE_KEY, locale);
    document.cookie = `${cookieNames.locale}=${locale}; path=/; max-age=31536000; SameSite=Lax`;
  } catch {
    /* ignore storage / cookie write failures */
  }
}
