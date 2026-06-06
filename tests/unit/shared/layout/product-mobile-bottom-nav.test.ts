import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { intlAppPaths } from '@/shared/routing/app-routes';

const bottomNavPath = resolve(
  process.cwd(),
  'src/shared/layout/mobile-product-shell/product-mobile-bottom-nav.tsx',
);

describe('ProductMobileBottomNav', () => {
  const source = readFileSync(bottomNavPath, 'utf8');

  it('usa BottomNav shared homologado com rotas reais do produto', () => {
    expect(source).toContain("from '@/shared/components/bottom-nav'");
    expect(source).toContain('bottomNavV2LightClassNames');
    expect(source).toContain('createPortal');
    expect(source).toContain('data-mobile-product-bottom-nav="true"');
    expect(source).toContain(`href: intlAppPaths.home`);
    expect(source).toContain(`href: intlAppPaths.dashboard.home`);
    expect(source).toContain(`href: intlAppPaths.cargos.marketplace`);
    expect(source).toContain(`href: intlAppPaths.negotiations.home`);
    expect(source).toContain(`href: intlAppPaths.tracking.home`);
    expect(source).toContain('resolveMobileBottomNavActiveId');
  });

  it('não referencia nav legado hx-mobile-bottom-nav', () => {
    expect(source).not.toContain('hx-mobile-bottom-nav');
    expect(source).not.toContain('mobileBottomNav');
  });

  it('não duplica estilos locais de bottom nav no product shell', () => {
    expect(source).not.toContain('mobile-product-shell.module.scss');
    expect(source).not.toContain('styles.bottomNav');
    expect(source).not.toContain('styles.navItem');
  });

  it('rotas de bottom nav batem com intlAppPaths', () => {
    expect(intlAppPaths.cargos.marketplace).toBe('/cargas');
    expect(intlAppPaths.negotiations.home).toBe('/negociacoes');
    expect(intlAppPaths.tracking.home).toBe('/rastreio');
  });

  it('usa BottomNav shared único sem duplicar componente local', () => {
    expect(source).toContain('<BottomNav');
    expect(source).not.toContain('function ProductMobileBottomNavItem');
    expect(source).not.toContain('mobileBottomNav');
  });
});
