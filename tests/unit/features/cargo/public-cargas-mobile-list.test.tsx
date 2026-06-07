import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Cargo } from '@/features/marketplace/domain/marketplace.types';
import { PublicCargasMobileList } from '@/features/cargo/components/public-cargas-mobile/public-cargas-mobile-list';

const listSourcePath = resolve(
  process.cwd(),
  'src/features/cargo/components/public-cargas-mobile/public-cargas-mobile-list.tsx',
);

vi.mock('next-intl', () => ({
  useTranslations: (namespace: string) => (key: string, values?: { count?: number }) => {
    if (namespace === 'operationsBoard' && key === 'filters.results' && values?.count != null) {
      return `${values.count} resultados`;
    }
    if (namespace === 'operationsBoard' && key === 'filters.clearAction') {
      return 'Limpar filtros';
    }
    if (namespace === 'common' && key === 'cargoStatus.boarded') {
      return 'Em trânsito';
    }
    if (namespace === 'common' && key === 'eta') {
      return 'ETA';
    }
    if (namespace === 'common' && key === 'emptyValue') {
      return '—';
    }
    return `${namespace}.${key}`;
  },
}));

vi.mock('@/core/i18n/navigation', () => ({
  Link: ({ children, href, ...rest }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock('@/shared/layout/mobile-product-shell', () => ({
  useMobileShellChrome: () => ({
    setBottomNavSuppressed: vi.fn(),
  }),
}));

const mockCargo: Cargo = {
  id: 'CRG-7845',
  title: 'Soja granel Manaus → Belém',
  origin: 'Manaus',
  destination: 'Belém',
  volume: '12.000 t',
  window: 'Jun/2026',
  status: 'boarded',
  cargoType: 'Granel',
  co2Saving: '18%',
  targetPrice: 'R$ 1.200.000',
  producer: 'Produtor mock',
  serviceType: 'Hidroviário',
  visibility: 'public',
};

const baseProps = {
  locale: 'pt-BR',
  filteredCargoes: [],
  query: '',
  onQueryChange: vi.fn(),
  statusFilter: 'all' as const,
  onStatusFilterToggle: vi.fn(),
  advancedFilters: {
    corridor: [],
    origin: [],
    destination: [],
    type: [],
    document: [],
  },
  onToggleAdvancedFilter: vi.fn(),
  activeFilters: 0,
  hasAppliedFilters: false,
  onResetFilters: vi.fn(),
  onSyncListViewport: vi.fn(),
  negotiations: [],
  vessels: [],
  filterOptions: {
    corridor: [],
    origin: [],
    destination: [],
    type: [],
    document: [],
  },
};

describe('PublicCargasMobileList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fixa light mode no SSR com escopo global root para os cards DS v2', () => {
    const html = renderToStaticMarkup(<PublicCargasMobileList {...baseProps} />);

    expect(html).toContain('data-theme="light"');
    expect(html).toContain('data-public-cargas-mobile="true"');
    expect(html).toContain('data-public-cargas-mobile-page-background="none"');
  });

  it('nao define background de pagina concorrente com o mobile shell', () => {
    const source = readFileSync(listSourcePath, 'utf8');
    const stylesPath = resolve(
      process.cwd(),
      'src/features/cargo/components/public-cargas-mobile/public-cargas-mobile-list.module.scss',
    );
    const stylesSource = readFileSync(stylesPath, 'utf8');

    expect(source).toContain('data-public-cargas-mobile-page-background="none"');
    expect(stylesSource).toContain('background: transparent');
  });

  it('nao repete titulo Lista de cargas no conteudo mobile', () => {
    const source = readFileSync(listSourcePath, 'utf8');
    const html = renderToStaticMarkup(
      <PublicCargasMobileList {...baseProps} filteredCargoes={[mockCargo]} />,
    );

    expect(source).not.toContain("tBoard('list.title')");
    expect(html).toContain('data-mobile-content-results="true"');
    expect(html).not.toContain('<h1');
  });

  it('renderiza apenas um botao de filtro visivel ao lado da search', () => {
    const source = readFileSync(listSourcePath, 'utf8');
    const html = renderToStaticMarkup(
      <PublicCargasMobileList {...baseProps} filteredCargoes={[mockCargo]} />,
    );

    expect(source).toContain('data-mobile-cargas-filter-button="true"');
    expect(source).toContain('iconButtonRole="field"');
    expect((html.match(/data-mobile-cargas-filter-button="true"/g) ?? []).length).toBe(1);
  });

  it('mostra Limpar filtros discreto ao lado do contador quando filtros estão ativos', () => {
    const htmlWithFilters = renderToStaticMarkup(
      <PublicCargasMobileList {...baseProps} filteredCargoes={[mockCargo]} hasAppliedFilters />,
    );
    const htmlWithoutFilters = renderToStaticMarkup(
      <PublicCargasMobileList {...baseProps} filteredCargoes={[mockCargo]} hasAppliedFilters={false} />,
    );

    expect(htmlWithFilters).toContain('data-mobile-clear-filters="true"');
    expect(htmlWithFilters).toContain('Limpar filtros');
    expect(htmlWithoutFilters).not.toContain('data-mobile-clear-filters="true"');
  });

  it('empty state filtrado não renderiza botão grande de limpar filtros', () => {
    const source = readFileSync(listSourcePath, 'utf8');
    const html = renderToStaticMarkup(
      <PublicCargasMobileList {...baseProps} hasAppliedFilters activeFilters={1} />,
    );

    expect(source).not.toContain("tBoard('list.clearFiltersAction')");
    expect(html).toContain('data-public-cargas-empty-state="true"');
    expect(html).toContain('data-public-cargas-empty-variant="filtered"');
    expect(html).toContain('data-public-cargas-empty-icon="true"');
    expect(html).toContain('data-informational-card="true"');
    expect(html).not.toContain('variant="secondary"');
  });

  it('empty state usa InformationalCard shared centralizado com respiro próprio', () => {
    const stylesPath = resolve(
      process.cwd(),
      'src/features/cargo/components/public-cargas-mobile/public-cargas-mobile-list.module.scss',
    );
    const stylesSource = readFileSync(stylesPath, 'utf8');

    expect(readFileSync(listSourcePath, 'utf8')).toContain('InformationalCard');
    expect(stylesSource).toContain('.emptyState');
    expect(stylesSource).toContain('margin-top: var(--hy-space-empty-state-offset');
    expect(stylesSource).not.toContain('.emptyStateIcon');
    expect(stylesSource).not.toContain('.emptyStateTitle');
    expect(stylesSource).not.toContain('.emptyStateDescription');
  });

  it('renderiza CTA Ver detalhes no card', () => {
    const source = readFileSync(listSourcePath, 'utf8');
    const html = renderToStaticMarkup(
      <PublicCargasMobileList {...baseProps} filteredCargoes={[mockCargo]} />,
    );

    expect(source).toContain("tBoard('list.cardActionView')");
    expect(html).toContain('operationsBoard.list.cardActionView');
  });
});
