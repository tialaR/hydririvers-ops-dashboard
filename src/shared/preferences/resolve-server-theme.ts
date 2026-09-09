import type { StoredTheme } from '@/shared/preferences/client-preferences';

/** Tema inicial quando não há cookie `hydrorivers.theme` (nem valor inválido). */
export const DEFAULT_STORED_THEME: StoredTheme = 'light';

/**
 * Resolve o tema do primeiro HTML/SSR a partir do cookie de tema.
 * Não usa `prefers-color-scheme` — ausência de preferência explícita => light.
 */
export function resolveServerTheme(themeCookieValue: string | undefined): StoredTheme {
  return themeCookieValue === 'light' || themeCookieValue === 'dark' ? themeCookieValue : DEFAULT_STORED_THEME;
}
