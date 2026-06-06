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

describe('Mobile product shell layout ownership', () => {
  const shellStyles = readFileSync(shellStylesPath, 'utf8');
  const headerSource = readFileSync(headerPath, 'utf8');
  const hookSource = readFileSync(hookPath, 'utf8');

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
    expect(headerSource).toContain('data-mobile-header-glass="true"');
    expect(shellStyles).toContain('backdrop-filter');
    expect(shellStyles).toContain('--hy-mobile-header-glass-height');
    expect(shellStyles).toContain('--hy-mobile-header-glass-bg');
    expect(shellStyles).toContain('--hy-mobile-header-glass-blur');
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

  it('header usa título expandido (paridade /dev-v2) e compacta via data-mobile-header-compact', () => {
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

  it('frost glass usa opacidades translúcidas sem barra sólida no compact', () => {
    const tokensPath = resolve(process.cwd(), 'src/shared/styles/tokens/_hy-v2-light.scss');
    const tokensSource = readFileSync(tokensPath, 'utf8');

    expect(tokensSource).toContain('--hy-mobile-header-frost-opacity-rest: 0.58');
    expect(tokensSource).toContain('--hy-mobile-header-frost-opacity-compact: 0.82');
    expect(tokensSource).toMatch(/--hy-shadow-mobile-header-glass-compact:[^;]+0\.0625rem/);
    expect(shellStyles).not.toMatch(/&\[data-mobile-header-compact='true'\]::before[\s\S]*0\.375rem 1\.25rem/);
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
