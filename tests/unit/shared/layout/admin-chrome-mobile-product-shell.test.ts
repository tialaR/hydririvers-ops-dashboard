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
    expect(headerSource).toContain('iconName="language"');
    expect(headerSource).toContain('iconName="notifications"');
    expect(headerSource).toContain("'profile'");
    expect(headerSource).toContain('data-mobile-header-actions="true"');
    expect(headerSource.indexOf('onOpenLocale')).toBeLessThan(headerSource.indexOf('onOpenNotifications'));
    expect(headerSource.indexOf('onOpenNotifications')).toBeLessThan(headerSource.indexOf('onOpenProfile'));
    expect(headerSource).not.toContain('Painel');
  });

  it('header mobile vive dentro do hr-dashboard-scroll para backdrop-filter real', () => {
    expect(adminSource.indexOf('hr-dashboard-scroll')).toBeLessThan(
      adminSource.indexOf('<MobileProductHeader'),
    );
    expect(adminSource.indexOf('<MobileProductHeader')).toBeLessThan(
      adminSource.indexOf('data-mobile-header-spacer'),
    );
  });

  it('shell root e scroll stage compartilham ownership do background global', () => {
    const adminStylesPath = resolve(
      process.cwd(),
      'src/shared/layout/admin-chrome/admin-chrome.module.scss',
    );
    const adminStyles = readFileSync(adminStylesPath, 'utf8');

    expect(adminSource).toContain("'data-mobile-shell-background': 'root'");
    expect(adminStyles).toContain('min-height: 100dvh');
    expect(adminStyles).toContain('flex-direction: column');
    expect(adminStyles).toContain('.mobileContentStage');
    expect(adminStyles).toContain('padding: 0 !important');
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
