import type { StoredLocale } from '@/shared/preferences/client-preferences';

/** Sigla curta exibida no botão de idioma do header mobile global. */
export function resolveMobileLocaleAbbrev(locale: StoredLocale): 'PT' | 'EN' | 'ES' {
  if (locale === 'pt-BR') {
    return 'PT';
  }

  if (locale === 'en-US') {
    return 'EN';
  }

  return 'ES';
}
