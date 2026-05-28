import { readFileSync } from 'node:fs';
import path from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

const mockIsMobileCargoListLabRouteEnabled = vi.hoisted(() => vi.fn(() => true));

vi.mock('@/shared/config/env', () => ({
  isMobileCargoListLabRouteEnabled: mockIsMobileCargoListLabRouteEnabled,
}));

vi.mock('next-intl/server', () => ({
  setRequestLocale: vi.fn(),
}));

vi.mock('@/features/cargo/services/cargo-list.service', () => ({
  cargoListService: {
    getMobileCargoListViewModel: vi.fn().mockResolvedValue({
      items: [],
      filters: { chips: [] },
      totalCount: 0,
    }),
  },
}));

vi.mock('@/features/cargo/components/mobile-list-lab/mobile-cargo-list-lab', () => ({
  MobileCargoListLab: () => (
    <div data-testid="mobile-cargo-list-lab" data-theme="dark" data-hydro-theme="dark">
      <h1>Lab Cargas</h1>
    </div>
  ),
}));

import MobileCargoListLabPage from '@/app/[locale]/dev/mobile-cargo-list-lab/page';

describe('mobile-cargo-list-lab shell isolation', () => {
  it('renderiza lab sem AdminChrome, Dashboard nem bottom nav', async () => {
    const tree = await MobileCargoListLabPage({
      params: Promise.resolve({ locale: 'pt-BR' }),
    });
    const html = renderToStaticMarkup(tree as React.ReactElement);

    expect(html).toContain('data-testid="mobile-cargo-list-lab"');
    expect(html).toContain('data-theme="dark"');
    expect(html).toContain('Lab Cargas');
    expect(html).not.toContain('data-testid="admin-chrome"');
    expect(html).not.toContain('hx-mobile-bottom-nav');
    expect(html).not.toContain('Dashboard');
  });

  it('página dev não está sob (product-shell)', () => {
    const pagePath = path.resolve(
      __dirname,
      '../../../src/app/[locale]/dev/mobile-cargo-list-lab/page.tsx',
    );
    expect(readFileSync(pagePath, 'utf8')).toContain('MobileCargoListLab');
    expect(
      readFileSync(
        path.resolve(__dirname, '../../../src/app/[locale]/(product-shell)/cargas/page.tsx'),
        'utf8',
      ),
    ).toContain('CargoesPage');
  });
});
