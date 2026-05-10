import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readStoredLocale, readStoredTheme, storedLocaleSchema, storedThemeSchema } from '@/shared/preferences/client-preferences';

function createLocalStorageStub() {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    }
  };
}

describe('client preferences', () => {
  const localStorageStub = createLocalStorageStub();

  beforeEach(() => {
    localStorageStub.clear();
    vi.stubGlobal('window', { localStorage: localStorageStub });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('falls back to the default theme when storage is invalid', () => {
    localStorageStub.setItem('hydrorivers:theme', 'purple');
    expect(readStoredTheme('dark')).toBe('dark');
  });

  it('falls back to the default locale when storage is invalid', () => {
    localStorageStub.setItem('hydrorivers:locale', 'fr');
    expect(readStoredLocale('pt-BR')).toBe('pt-BR');
  });

  it('accepts only supported themes and locales', () => {
    expect(storedThemeSchema.safeParse('dark').success).toBe(true);
    expect(storedThemeSchema.safeParse('light').success).toBe(true);
    expect(storedLocaleSchema.safeParse('pt-BR').success).toBe(true);
    expect(storedLocaleSchema.safeParse('en-US').success).toBe(true);
    expect(storedLocaleSchema.safeParse('es').success).toBe(true);
  });
});
