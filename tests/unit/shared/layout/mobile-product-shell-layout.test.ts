import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const shellStylesPath = resolve(
  process.cwd(),
  'src/shared/layout/mobile-product-shell/mobile-product-shell.module.scss',
);
const headerPath = resolve(
  process.cwd(),
  'src/shared/layout/mobile-product-shell/mobile-product-header.tsx',
);
const hookPath = resolve(
  process.cwd(),
  'src/shared/layout/mobile-product-shell/use-mobile-header-scroll.ts',
);
const adminChromeStylesPath = resolve(
  process.cwd(),
  'src/shared/layout/admin-chrome/admin-chrome.module.scss',
);

describe('Mobile product shell layout ownership', () => {
  const shellStyles = readFileSync(shellStylesPath, 'utf8');
  const headerSource = readFileSync(headerPath, 'utf8');
  const hookSource = readFileSync(hookPath, 'utf8');
  const adminChromeStyles = readFileSync(adminChromeStylesPath, 'utf8');

  it('mobileScrollStage delega canvas ao shell root e permanece transparente', () => {
    expect(shellStyles).toContain('.mobileScrollStage');
    expect(shellStyles).toContain('background: transparent');
    expect(shellStyles).toContain('--hy-spacing-shell-padding-inline');
    expect(shellStyles).not.toMatch(/\.mobileScrollStage[\s\S]*mobile-product-v2-light-page-background/);
  });

  it('header não cria moldura concorrente ao canvas (fundo transparente)', () => {
    expect(shellStyles).toContain('.header');
    expect(shellStyles).toContain('background: transparent');
    expect(shellStyles).not.toMatch(/\.header\s*\{[^}]*border-bottom:\s*1px/);
  });

  it('header expõe marker de glassmorphism com área completa via ::before', () => {
    const tokensPath = resolve(process.cwd(), 'src/shared/styles/tokens/_hy-v2-light.scss');
    const tokensSource = readFileSync(tokensPath, 'utf8');

    expect(headerSource).toContain('data-mobile-header-glass="true"');
    expect(shellStyles).toContain('backdrop-filter');
    expect(shellStyles).toContain('isolation: isolate');
    expect(shellStyles).toContain('overflow: visible');
    expect(shellStyles).toContain('var(--hy-mobile-header-glass-bleed');
    expect(shellStyles).toContain('var(--hy-mobile-header-glass-blur');
    expect(tokensSource).toContain('--hy-mobile-header-glass-bg');
    expect(tokensSource).toContain('--hy-mobile-header-glass-mask');
    expect(shellStyles).not.toContain('mask-image: linear-gradient(180deg, #000 0%, #000 58%');
  });

  it('mobileScrollStage preenche viewport com min-height 100dvh', () => {
    expect(shellStyles).toContain('min-height: 100dvh');
  });

  it('mobileScrollStage reserva spacer para header fixed global', () => {
    expect(shellStyles).toContain('.mobileHeaderSpacer');
    expect(shellStyles).toContain('--hy-mobile-header-spacer-height');
    expect(shellStyles).toContain("[data-mobile-header-spacer='true']");
  });

  it('header mobile usa position fixed no viewport em <=860px', () => {
    expect(shellStyles).toMatch(/@media \(max-width: 860px\)[\s\S]*?\.header \{[\s\S]*?position:\s*fixed/);
  });

  it('header usa título expandido (contrato HY /cargas) e compacta via data-mobile-header-compact', () => {
    expect(shellStyles).toContain('--hy-font-size-page-title-expanded');
    expect(shellStyles).toContain('2.75rem');
    expect(shellStyles).toContain('--hy-font-size-nav-title-compact');
    expect(shellStyles).toContain('.pageTitleExpanded');
    expect(shellStyles).toContain('.pageTitleCompact');
    expect(shellStyles).toContain('--hy-mobile-header-frost-opacity-rest');
    expect(shellStyles).toContain('--hy-mobile-header-frost-opacity-compact');
    expect(headerSource).toContain('data-mobile-page-title-variant="navigation"');
    expect(headerSource).toContain('data-mobile-header-compact');
    expect(headerSource).toContain('data-scroll-compact');
  });

  it('header compact reage ao scroll do container hr-dashboard-scroll e window', () => {
    expect(hookSource).toContain('MOBILE_PRODUCT_SCROLL_SELECTOR');
    expect(hookSource).toContain('.hr-dashboard-scroll');
    expect(hookSource).toContain('resolveMobileHeaderScrollOffset');
    expect(hookSource).toContain("capture: true");
  });

  it('título compacto expõe offset semântico acima do bottom do header', () => {
    expect(shellStyles).toContain('--hy-mobile-header-compact-title-offset');
    expect(shellStyles).toContain('.pageTitleCompact');
    expect(shellStyles).toMatch(/\.pageTitleCompact[\s\S]*transform:\s*translateY\(var\(--hy-mobile-header-compact-title-offset/);
    expect(headerSource).toContain('data-mobile-page-title-compact-offset');
    expect(shellStyles).toContain('--hy-mobile-header-compact-padding-bottom');
  });

  it('frost glass desliga backdrop-filter no rest mobile e liga só no compact', () => {
    expect(shellStyles).toMatch(
      /@media \(max-width: 860px\)[\s\S]*?&::before \{[\s\S]*?backdrop-filter:\s*none/,
    );
    expect(shellStyles).toMatch(
      /&\[data-mobile-header-compact='true'\]::before[\s\S]*?backdrop-filter:\s*var\(--hy-mobile-header-glass-blur\)/,
    );
  });

  it('frost glass delega tokens HY e intensifica ao compactar no scroll', () => {
    const tokensPath = resolve(process.cwd(), 'src/shared/styles/tokens/_hy-v2-light.scss');
    const tokensSource = readFileSync(tokensPath, 'utf8');

    expect(tokensSource).toContain('--hy-mobile-header-frost-opacity-rest: 0');
    expect(tokensSource).toContain('--hy-mobile-header-frost-opacity-compact: 0.98');
    expect(tokensSource).toContain('--hy-mobile-header-glass-blur: blur(1.125rem) saturate(1.24)');
    expect(tokensSource).toContain('--hy-mobile-header-glass-blur-rest: blur(1.125rem) saturate(1.24)');
    expect(shellStyles).toContain('opacity: var(--hy-mobile-header-frost-opacity-rest, 0)');
    expect(shellStyles).toContain('opacity: var(--hy-mobile-header-frost-opacity-compact, 1)');
    expect(tokensSource).toContain('--hy-mobile-header-glass-blur-rest: blur(1.125rem) saturate(1.24)');
    expect(shellStyles).not.toMatch(/\.header\s*\{[^}]*--hy-mobile-header-frost-opacity-rest:/);
  });

  it('frost glass usa opacidades translúcidas sem barra sólida no compact', () => {
    const tokensPath = resolve(process.cwd(), 'src/shared/styles/tokens/_hy-v2-light.scss');
    const tokensSource = readFileSync(tokensPath, 'utf8');

    expect(tokensSource).toContain('--hy-mobile-header-glass-bleed');
    expect(tokensSource).toContain('--hy-color-mobile-header-glass-compact-surface');
    expect(tokensSource).toMatch(/--hy-shadow-mobile-header-glass-compact:[^;]+0\.0625rem/);
    expect(shellStyles).toContain('var(--hy-color-mobile-header-glass-compact-surface)');
    expect(shellStyles).not.toMatch(/&\[data-mobile-header-compact='true'\]::before[\s\S]*0\.375rem 1\.25rem/);
  });

  it('frost glass não anima backdrop-filter (evita ghosting no scroll light mode)', () => {
    expect(shellStyles).toContain('contain: paint');
    expect(shellStyles).toContain('var(--hy-mobile-header-glass-paint-layer');
    expect(shellStyles).toContain('background-color var(--hy-motion-duration-header-frost');
    expect(shellStyles).not.toMatch(/\.header::before[\s\S]*backdrop-filter var\(--hy-motion-duration-header/);
    expect(shellStyles).not.toMatch(/\.header::before[\s\S]*transition:[\s\S]*\bbackground var\(--hy-motion-duration-header/);
  });

  it('animações do header ficam no módulo do shell com prefers-reduced-motion', () => {
    expect(shellStyles).toContain('var(--hy-motion-duration-header');
    expect(shellStyles).toContain('var(--hy-motion-ease-standard');
    expect(shellStyles).toMatch(/@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.header/);
  });

  it('header global é único no AdminChrome sem header local de feature', () => {
    const adminChromePath = resolve(process.cwd(), 'src/shared/layout/admin-chrome/admin-chrome.tsx');
    const adminSource = readFileSync(adminChromePath, 'utf8');
    const publicCargasPath = resolve(
      process.cwd(),
      'src/features/cargo/public/components/public-cargas-mobile/public-cargas-mobile-list.tsx',
    );
    const publicCargasSource = readFileSync(publicCargasPath, 'utf8');

    expect(adminSource).toContain('<MobileProductHeader');
    expect(adminSource).toContain('data-hy-mobile-canvas');
    expect(publicCargasSource).not.toContain('MobileProductHeader');
    expect(publicCargasSource).not.toContain('data-mobile-product-shell');
  });

  it('admin chrome aplica canvas light no first paint mobile antes da detecção JS', () => {
    expect(adminChromeStyles).toMatch(/@media \(max-width: 860px\)[\s\S]*:global\(\.hr-shell\.hx-shell\)/);
    expect(adminChromeStyles).toMatch(
      /:global\(\.hr-shell\.hx-shell\)[\s\S]*mobile-product-v2-light-page-background/,
    );
    expect(adminChromeStyles).toMatch(
      /:global\(\.hr-shell\.hx-shell\)[\s\S]*--hy-color-text-primary/,
    );
  });

  it('brand e actions permanecem no markup compacto', () => {
    expect(headerSource).toContain('data-mobile-brand="true"');
    expect(headerSource).toContain('data-mobile-header-actions="true"');
    expect(headerSource).toContain('pageTitleCompact');
    expect(headerSource).not.toContain('isCompact ? null');
  });

  it('desktop não renderiza header mobile', () => {
    expect(shellStyles).toMatch(/@media \(min-width: 861px\)[\s\S]*?\.header \{[\s\S]*?display:\s*none/);
  });
});
