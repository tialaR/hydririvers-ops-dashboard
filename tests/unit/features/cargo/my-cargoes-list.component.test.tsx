import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { MyCargoesList } from '@/features/cargo-market/components/my-cargoes-list/my-cargoes-list';
import { userCargosMock } from '@/features/cargo/mocks/owned-cargos.mock';

vi.mock('next-intl', () => ({
  useTranslations: (namespace?: string) => (key: string, values?: Record<string, string | number>) => {
    if (values) {
      return `${namespace ?? 'root'}:${key}:${JSON.stringify(values)}`;
    }
    return `${namespace ?? 'root'}:${key}`;
  },
  useLocale: () => 'pt-BR',
}));

vi.mock('@/core/i18n/navigation', () => ({
  Link: ({ children, href, ...rest }: { children: React.ReactNode; href: string }) =>
    createElement('a', { href, ...rest }, children),
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/shared/layout/mobile-product-shell', () => ({
  useMobileShellChrome: () => ({ setBottomNavSuppressed: vi.fn() }),
}));

describe('MyCargoesList', () => {
  it('renderiza resumo compacto, busca premium e cards owned com dados mock', () => {
    const html = renderToStaticMarkup(
      createElement(MyCargoesList, {
        cargoes: userCargosMock.slice(0, 2),
        canCreateCargo: true,
      }),
    );

    expect(html).toContain('data-testid="minhas-cargas-summary"');
    expect(html).toContain('data-testid="minhas-cargas-grid"');
    expect(html).toContain('data-testid="owned-cargo-card"');
    expect(html).toContain('data-testid="minhas-cargas-search"');
    expect(html).toContain('data-testid="minhas-cargas-filter-button"');
    expect(html).toContain('pages.minhasCargas:searchPlaceholder');
    expect(html).not.toContain('data-testid="cargo-card"');
    expect(html).not.toContain('data-testid="minhas-cargas-clear-filters"');
  });

  it('renderiza chips de filtro operacionais com labels i18n', () => {
    const html = renderToStaticMarkup(
      createElement(MyCargoesList, {
        cargoes: userCargosMock,
        canCreateCargo: true,
      }),
    );

    expect(html).toContain('data-testid="minhas-cargas-list-filters"');
    expect(html).toContain('data-testid="minhas-cargas-filter-all"');
    expect(html).toContain('data-testid="minhas-cargas-filter-open"');
    expect(html).toContain('data-testid="minhas-cargas-filter-inTransit"');
    expect(html).toContain('data-testid="minhas-cargas-filter-documents"');
    expect(html).toContain('data-testid="minhas-cargas-filter-risk"');
    expect(html).toContain('pages.minhasCargas.listFilters:open');
    expect(html).toContain('pages.minhasCargas.listFilters:risk');
  });

  it('renderiza empty state quando não há cargas', () => {
    const html = renderToStaticMarkup(
      createElement(MyCargoesList, {
        cargoes: [],
        canCreateCargo: true,
      }),
    );

    expect(html).toContain('data-testid="minhas-cargas-empty"');
    expect(html).not.toContain('data-testid="owned-cargo-card"');
    expect(html).not.toContain('data-testid="minhas-cargas-summary"');
    expect(html).not.toContain('data-testid="minhas-cargas-list-filters"');
    expect(html).not.toContain('pages.minhasCargas:searchPlaceholder');
  });

  it('mantém cards com href de detalhe na lista inicial (filtro Todas)', () => {
    const html = renderToStaticMarkup(
      createElement(MyCargoesList, {
        cargoes: userCargosMock.slice(0, 1),
        canCreateCargo: true,
      }),
    );

    expect(html).toContain('data-owned-cargo-id="MY-CARGO-001"');
    expect(html).toMatch(/href="[^"]*MY-CARGO-001[^"]*"/);
  });
});
