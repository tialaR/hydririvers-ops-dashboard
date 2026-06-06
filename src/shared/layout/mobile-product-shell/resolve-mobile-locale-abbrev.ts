import type { StoredLocale } from '@/shared/preferences/client-preferences';

/** Sigla curta exibida no botão de idioma do header mobile (DS v2). */
export function resolveMobileLocaleAbbrev(locale: StoredLocale): 'PT' | 'EN' | 'ES' {
  if (locale === 'pt-BR') {
    return 'PT';
  }

  if (locale === 'en-US') {
    return 'EN';
  }

  return 'ES';
}
