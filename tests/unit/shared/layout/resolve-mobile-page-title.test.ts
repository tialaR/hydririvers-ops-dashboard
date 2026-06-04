import { describe, expect, it } from 'vitest';

import { intlAppPaths } from '@/shared/routing/app-routes';
import {
  resolveMobileBottomNavActiveId,
  resolveMobilePageTitleKey,
} from '@/shared/layout/mobile-product-shell/resolve-mobile-page-title';

describe('resolveMobilePageTitleKey', () => {
  it('resolve Cargas na lista pública', () => {
    expect(resolveMobilePageTitleKey(intlAppPaths.cargos.marketplace)).toBe('nav.cargoes');
  });

  it('não usa header.title genérico para workspace de cargas', () => {
    expect(resolveMobilePageTitleKey(intlAppPaths.cargos.marketplace)).not.toBe('adminChrome.header.title');
  });

  it('resolve detalhe e mapa de carga', () => {
    expect(resolveMobilePageTitleKey(`${intlAppPaths.cargos.marketplace}/CRG-001`)).toBe(
      'adminChrome.mobile.pageTitles.cargoDetail',
    );
    expect(resolveMobilePageTitleKey(`${intlAppPaths.cargos.marketplace}/CRG-001/mapa`)).toBe(
      'adminChrome.mobile.pageTitles.cargoMap',
    );
  });

  it('resolve rotas principais do shell', () => {
    expect(resolveMobilePageTitleKey(intlAppPaths.dashboard.home)).toBe('nav.dashboard');
    expect(resolveMobilePageTitleKey(intlAppPaths.negotiations.home)).toBe('nav.negotiations');
    expect(resolveMobilePageTitleKey(intlAppPaths.tracking.home)).toBe('nav.tracking');
    expect(resolveMobilePageTitleKey(intlAppPaths.vessels.marketplace)).toBe('nav.vessels');
    expect(resolveMobilePageTitleKey(intlAppPaths.auth.profile)).toBe('nav.profile');
  });
});

describe('resolveMobileBottomNavActiveId', () => {
  it('marca cargas ativo em subrotas de marketplace', () => {
    expect(resolveMobileBottomNavActiveId(intlAppPaths.cargos.marketplace)).toBe('cargos');
    expect(resolveMobileBottomNavActiveId(`${intlAppPaths.cargos.marketplace}/CRG-1/mapa`)).toBe(
      'cargos',
    );
  });

  it('marca negociações e rastreio conforme rota', () => {
    expect(resolveMobileBottomNavActiveId(intlAppPaths.negotiations.home)).toBe('negotiations');
    expect(resolveMobileBottomNavActiveId(`${intlAppPaths.negotiations.home}/NEG-1`)).toBe(
      'negotiations',
    );
    expect(resolveMobileBottomNavActiveId(intlAppPaths.tracking.home)).toBe('tracking');
    expect(resolveMobileBottomNavActiveId(intlAppPaths.dashboard.home)).toBe('dashboard');
  });
});
