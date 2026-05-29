import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

const mockSetRequestLocale = vi.hoisted(() => vi.fn());

vi.mock('@/shared/config/env', () => ({
  isMobileCargoListLabRouteEnabled: () => true,
}));

vi.mock('next-intl/server', () => ({
  setRequestLocale: mockSetRequestLocale,
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
  MobileCargoListLab: ({ locale }: { locale: string }) => (
    <div data-testid="mobile-cargo-list-lab" data-locale={locale}>
      Lab
    </div>
  ),
}));

import MobileCargoListLabPage from '@/app/[locale]/dev/mobile-cargo-list-lab/page';

describe('MobileCargoListLabPage', () => {
  it('renderiza componente da lab com locale', async () => {
    const tree = await MobileCargoListLabPage({
      params: Promise.resolve({ locale: 'pt-BR' }),
    });
    const html = renderToStaticMarkup(tree as React.ReactElement);

    expect(mockSetRequestLocale).toHaveBeenCalledWith('pt-BR');
    expect(html).toContain('data-testid="mobile-cargo-list-lab"');
    expect(html).toContain('data-locale="pt-BR"');
    expect(html).not.toContain('Dashboard');
  });
});
