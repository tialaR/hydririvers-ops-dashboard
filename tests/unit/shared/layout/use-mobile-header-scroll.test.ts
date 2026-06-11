import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const hookPath = resolve(
  process.cwd(),
  'src/shared/layout/mobile-product-shell/use-mobile-header-scroll.ts',
);
const headerPath = resolve(
  process.cwd(),
  'src/shared/layout/mobile-product-shell/mobile-product-header.tsx',
);

describe('useMobileHeaderScroll', () => {
  const hookSource = readFileSync(hookPath, 'utf8');
  const headerSource = readFileSync(headerPath, 'utf8');

  it('escuta hr-dashboard-scroll com fallback window/document capture', () => {
    expect(hookSource).toContain('MOBILE_PRODUCT_SCROLL_SELECTOR');
    expect(hookSource).toContain('.hr-dashboard-scroll');
    expect(hookSource).toContain('resolveMobileHeaderScrollOffset');
    expect(hookSource).toContain("addEventListener('scroll', onScroll, { passive: true, capture: true })");
    expect(hookSource).toContain('requestAnimationFrame');
    expect(hookSource).toContain('removeEventListener');
  });

  it('usa threshold de 24px para compact state', () => {
    expect(hookSource).toContain('MOBILE_HEADER_COMPACT_SCROLL_Y = 24');
  });

  it('MobileProductHeader consome hook global e expõe marker compact', () => {
    expect(headerSource).toContain("from './use-mobile-header-scroll'");
    expect(headerSource).toContain('useMobileHeaderScroll');
    expect(headerSource).toContain('data-mobile-header-compact');
    expect(headerSource).toContain('pageTitleExpanded');
    expect(headerSource).toContain('pageTitleCompact');
  });

  it('MobileProductHeader sincroniza spacer height via ResizeObserver', () => {
    expect(headerSource).toContain('ResizeObserver');
    expect(headerSource).toContain('--hy-mobile-header-spacer-height');
  });
});
