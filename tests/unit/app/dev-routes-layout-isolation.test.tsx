import { readFileSync } from 'node:fs';
import path from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import DevRoutesLayout from '@/app/[locale]/dev/layout';

const appLocaleDir = path.resolve(__dirname, '../../../src/app/[locale]');

describe('dev routes layout isolation', () => {
  it('layout dev não importa AdminChrome nem LocaleShell', () => {
    const source = readFileSync(path.join(appLocaleDir, 'dev/layout.tsx'), 'utf8');

    expect(source).not.toContain('AdminChrome');
    expect(source).not.toContain('LocaleShell');
    expect(source).toContain('data-testid="dev-routes-layout"');
  });

  it('layout locale não envolve children com LocaleShell', () => {
    const source = readFileSync(path.join(appLocaleDir, 'layout.tsx'), 'utf8');

    expect(source).toContain('HydroDesignSystemRoot');
    expect(source).not.toMatch(/<LocaleShell[\s>]/);
  });

  it('product shell layout aplica LocaleShell', () => {
    const source = readFileSync(path.join(appLocaleDir, '(product-shell)/layout.tsx'), 'utf8');

    expect(source).toContain('LocaleShell');
  });

  it('renderiza container neutro sem chrome de produto', () => {
    const html = renderToStaticMarkup(
      <DevRoutesLayout>
        <main data-testid="lab-page">Lab</main>
      </DevRoutesLayout>,
    );

    expect(html).toContain('data-testid="dev-routes-layout"');
    expect(html).toContain('data-hydro-dev-route="true"');
    expect(html).toContain('Lab');
    expect(html).not.toContain('data-testid="admin-chrome"');
    expect(html).not.toContain('hx-mobile-bottom-nav');
    expect(html).not.toContain('Dashboard');
  });
});
