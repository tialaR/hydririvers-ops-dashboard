import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = readFileSync(
  resolve(process.cwd(), 'src/shared/layout/mobile-product-shell/product-mobile-bottom-nav.tsx'),
  'utf8',
);

describe('ProductMobileBottomNav', () => {
  it('usa BottomNav shared global com rotas reais do produto', () => {
    expect(source).toContain("from '@/shared/components/bottom-nav'");
    expect(source).toContain('PRODUCT_MOBILE_BOTTOM_NAV_ITEMS');
    expect(source).toContain('intlAppPaths.home');
    expect(source).toContain('intlAppPaths.dashboard.home');
    expect(source).toContain('intlAppPaths.cargos.marketplace');
    expect(source).toContain('intlAppPaths.negotiations.home');
    expect(source).toContain('intlAppPaths.tracking.home');
  });

  it('não usa skin antiga nem classNames legadas no shell mobile', () => {
    expect(source).not.toContain('bottomNavHyLightClassNames');
    expect(source).not.toContain('bottomNavHyDarkGlassClassNames');
    expect(source).not.toContain('bottomNavClassNames');
    expect(source).not.toContain('classNames={{');
    expect(source).not.toContain('isCargasMobileRoute');
  });

  it('marca o runtime como preview global', () => {
    expect(source).toContain('data-mobile-product-bottom-nav="true"');
    expect(source).toContain('data-bottom-nav-viewport-anchor="true"');
    expect(source).toContain('data-bottom-nav-skin="preview-global"');
  });

  it('mantém retorno especial para detalhe de carga', () => {
    expect(source).toContain('isCargoDetailPath');
    expect(source).toContain('shouldForceCargoListReturn');
    expect(source).toContain('router.replace(slot.href as never)');
  });

  it('usa BottomNav shared único sem duplicar componente local', () => {
    expect(source).toContain('<BottomNav');
    expect(source).not.toContain('function MobileBottomNav');
    expect(source).not.toContain('hx-mobile-bottom-nav');
  });
});
