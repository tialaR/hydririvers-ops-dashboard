import { describe, expect, it } from 'vitest';
import { mainNavigation, resolveActiveNavigationHref } from '@/shared/config/navigation';
import { intlAppPaths } from '@/shared/routing/app-routes';

describe('shared/config/navigation', () => {
  it('mantém a navegação canônica estável para sidebar e mobile', () => {
    expect(mainNavigation.map((item) => item.href)).toEqual([
      intlAppPaths.home,
      intlAppPaths.dashboard.home,
      intlAppPaths.cargos.marketplace,
      intlAppPaths.cargos.myCargos,
      intlAppPaths.vessels.marketplace,
      intlAppPaths.negotiations.home,
      intlAppPaths.tracking.home,
      intlAppPaths.impact.home,
      intlAppPaths.government.home,
      intlAppPaths.admin.home
    ]);
  });

  it('mantém myCargos como rota canônica sem alias quebrado', () => {
    expect(intlAppPaths.cargos.myCargos).toBe('/minhas-cargas');
    expect(mainNavigation.find((item) => item.labelKey === 'myCargoes')?.href).toBe('/minhas-cargas');
  });

  it('respeita rotas filhas ao resolver item ativo da sidebar', () => {
    expect(resolveActiveNavigationHref('/pt-BR/dashboard')).toBe('/dashboard');
    expect(resolveActiveNavigationHref('/pt-BR/cargas')).toBe('/cargas');
    expect(resolveActiveNavigationHref('/pt-BR/minhas-cargas')).toBe('/minhas-cargas');
    expect(resolveActiveNavigationHref('/pt-BR/minhas-cargas/MY-CARGO-001')).toBe('/minhas-cargas');
    expect(resolveActiveNavigationHref('/pt-BR/cargas/CARGO-001')).toBe('/cargas');
  });
});
