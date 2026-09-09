import { describe, expect, it } from 'vitest';

import {
  createOwnedCargoPanelHref,
  hasInvalidOwnedCargoPanelParam,
  removeOwnedCargoPanelParam,
  resolveOwnedCargoPanelFromSearchParams,
} from '@/features/cargo/domain/owned-cargo-panel-search-params';

describe('resolveOwnedCargoPanelFromSearchParams', () => {
  it('resolve panel=map', () => {
    expect(resolveOwnedCargoPanelFromSearchParams(new URLSearchParams('panel=map'))).toBe('map');
  });

  it('resolve panel=timeline', () => {
    expect(resolveOwnedCargoPanelFromSearchParams(new URLSearchParams('panel=timeline'))).toBe(
      'timeline',
    );
  });

  it('resolve panel=documents', () => {
    expect(resolveOwnedCargoPanelFromSearchParams(new URLSearchParams('panel=documents'))).toBe(
      'documents',
    );
  });

  it('resolve panel=risks', () => {
    expect(resolveOwnedCargoPanelFromSearchParams(new URLSearchParams('panel=risks'))).toBe('risks');
  });

  it('resolve panel=tracking', () => {
    expect(resolveOwnedCargoPanelFromSearchParams(new URLSearchParams('panel=tracking'))).toBe('tracking');
  });

  it('resolve panel=process', () => {
    expect(resolveOwnedCargoPanelFromSearchParams(new URLSearchParams('panel=process'))).toBe('process');
  });

  it('retorna null para panel inválido', () => {
    expect(resolveOwnedCargoPanelFromSearchParams(new URLSearchParams('panel=banana'))).toBeNull();
  });

  it('retorna null sem panel', () => {
    expect(resolveOwnedCargoPanelFromSearchParams(new URLSearchParams('scope=active'))).toBeNull();
  });
});

describe('hasInvalidOwnedCargoPanelParam', () => {
  it('detecta panel inválido', () => {
    expect(hasInvalidOwnedCargoPanelParam(new URLSearchParams('panel=banana'))).toBe(true);
  });

  it('ignora panel válido ou ausente', () => {
    expect(hasInvalidOwnedCargoPanelParam(new URLSearchParams('panel=map'))).toBe(false);
    expect(hasInvalidOwnedCargoPanelParam(new URLSearchParams())).toBe(false);
  });
});

describe('createOwnedCargoPanelHref', () => {
  it('gera URL com panel esperado', () => {
    expect(
      createOwnedCargoPanelHref('/pt-BR/minhas-cargas/CARGO-001', new URLSearchParams(), 'map'),
    ).toBe('/pt-BR/minhas-cargas/CARGO-001?panel=map');
  });

  it('preserva outros search params', () => {
    expect(
      createOwnedCargoPanelHref(
        '/pt-BR/minhas-cargas/CARGO-001',
        new URLSearchParams('scope=active&panel=map'),
        'timeline',
      ),
    ).toBe('/pt-BR/minhas-cargas/CARGO-001?scope=active&panel=timeline');
  });
});

describe('removeOwnedCargoPanelParam', () => {
  it('remove panel da URL', () => {
    expect(
      removeOwnedCargoPanelParam(
        '/pt-BR/minhas-cargas/CARGO-001',
        new URLSearchParams('panel=map'),
      ),
    ).toBe('/pt-BR/minhas-cargas/CARGO-001');
  });

  it('preserva outros search params ao remover panel', () => {
    expect(
      removeOwnedCargoPanelParam(
        '/pt-BR/minhas-cargas/CARGO-001',
        new URLSearchParams('scope=active&panel=documents'),
      ),
    ).toBe('/pt-BR/minhas-cargas/CARGO-001?scope=active');
  });
});
