import { describe, expect, it } from 'vitest';

import { resolveMobileLocaleAbbrev } from '@/shared/layout/mobile-product-shell/resolve-mobile-locale-abbrev';

describe('resolveMobileLocaleAbbrev', () => {
  it('retorna siglas PT, EN e ES por locale', () => {
    expect(resolveMobileLocaleAbbrev('pt-BR')).toBe('PT');
    expect(resolveMobileLocaleAbbrev('en-US')).toBe('EN');
    expect(resolveMobileLocaleAbbrev('es')).toBe('ES');
  });
});
