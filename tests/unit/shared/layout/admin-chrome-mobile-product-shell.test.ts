import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const adminChromePath = resolve(
  process.cwd(),
  'src/shared/layout/admin-chrome/admin-chrome.tsx',
);
const headerPath = resolve(
  process.cwd(),
  'src/shared/layout/mobile-product-shell/mobile-product-header.tsx',
);

describe('AdminChrome mobile product shell', () => {
  const adminSource = readFileSync(adminChromePath, 'utf8');
  const headerSource = readFileSync(headerPath, 'utf8');

  it('usa header DS v2 light e resolve título por rota', () => {
    expect(adminSource).toContain('MobileProductHeader');
    expect(headerSource).toContain('resolveMobilePageTitleKey');
    expect(adminSource).not.toContain('hx-mobile-topbar');
    expect(adminSource).not.toContain('mobileSearchTrigger');
    expect(adminSource).not.toContain('isCargoWorkspacePath');
    expect(adminSource).not.toContain("? tChrome('header.title')");
    expect(headerSource).toContain('data-mobile-product-shell="true"');
    expect(headerSource).toContain('data-theme="light"');
    expect(headerSource).toContain('resolveMobilePageTitleKey');
  });

  it('header actions: language, notifications, profile com IconButton', () => {
    expect(headerSource).toContain("from '@/shared/components/icon-button'");
    expect(headerSource).toContain('<Languages');
    expect(headerSource).toContain('<Bell');
    expect(headerSource).toContain('<User');
    expect(headerSource).toContain('data-mobile-header-actions="true"');
    expect(headerSource.indexOf('onOpenLocale')).toBeLessThan(headerSource.indexOf('onOpenNotifications'));
    expect(headerSource.indexOf('onOpenNotifications')).toBeLessThan(headerSource.indexOf('onOpenProfile'));
    expect(headerSource).not.toContain('Painel');
  });

  it('marca shell mobile light-first no AdminChrome', () => {
    expect(adminSource).toContain('data-mobile-product-v2-shell');
    expect(adminSource).toContain("data-theme': 'light'");
  });

  it('usa bottom nav DS v2 portaled compartilhado', () => {
    expect(adminSource).toContain('ProductMobileBottomNav');
    expect(adminSource).toContain('MobileShellChromeProvider');
    expect(adminSource).not.toContain('styles.mobileBottomNav');
    expect(adminSource).not.toContain('hx-mobile-bottom-nav');
  });
});
