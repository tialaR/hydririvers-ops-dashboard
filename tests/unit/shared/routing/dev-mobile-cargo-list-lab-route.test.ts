import { describe, expect, it } from 'vitest';

import { isDevMobileCargoListLabPathname, isDevSegmentPathname } from '@/shared/routing/app-routes';

describe('isDevSegmentPathname', () => {
  it('reconhece segmento /dev', () => {
    expect(isDevSegmentPathname('/pt-BR/dev/mobile-cargo-list-lab')).toBe(true);
    expect(isDevSegmentPathname('/dev/hydroway-map-spike')).toBe(true);
    expect(isDevSegmentPathname('/pt-BR/cargas')).toBe(false);
  });
});

describe('isDevMobileCargoListLabPathname', () => {
  it('reconhece a rota lab com e sem prefixo de locale', () => {
    expect(isDevMobileCargoListLabPathname('/dev/mobile-cargo-list-lab')).toBe(true);
    expect(isDevMobileCargoListLabPathname('/pt-BR/dev/mobile-cargo-list-lab')).toBe(true);
    expect(isDevMobileCargoListLabPathname('/en-US/dev/mobile-cargo-list-lab')).toBe(true);
  });

  it('não confunde com rotas de produto', () => {
    expect(isDevMobileCargoListLabPathname('/pt-BR/cargas')).toBe(false);
    expect(isDevMobileCargoListLabPathname('/pt-BR/dashboard')).toBe(false);
    expect(isDevMobileCargoListLabPathname('/pt-BR/dev/hydroway-map-spike')).toBe(false);
  });
});
