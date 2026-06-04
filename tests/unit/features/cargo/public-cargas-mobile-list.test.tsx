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

vi.mock('@/shared/components/bottom-sheet', () => ({
  BottomSheet: ({
    open,
    title,
    children,
    variant,
  }: {
    open: boolean;
    title: string;
    children: React.ReactNode;
    variant?: string;
  }) =>
    open ? (
      <section data-testid="public-cargo-action-sheet" data-variant={variant} data-title={title}>
        {children}
      </section>
    ) : null,
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
    expect(html).toMatch(/\broot\b/);
  });

  it('suprime bottom nav do shell quando sheets públicos estão abertos', () => {
    const source = readFileSync(listSourcePath, 'utf8');

    expect(source).toContain('useMobileShellChrome');
    expect(source).toContain('setBottomNavSuppressed');
    expect(source).not.toContain('PublicCargasMobileBottomNav');
  });

  it('reserva respiro inferior na shell da lista para o bottom nav fixo do produto', () => {
    const stylesPath = resolve(
      process.cwd(),
      'src/features/cargo/components/public-cargas-mobile/public-cargas-mobile-list.module.scss',
    );
    const stylesSource = readFileSync(stylesPath, 'utf8');

    expect(stylesSource).toContain('--hy-size-bottom-nav-height');
    expect(stylesSource).toContain('.shell');
    expect(stylesSource).toContain('padding:');
    expect(stylesSource).not.toContain('cargo-v2-light-bottom-nav-shell');
    expect(stylesSource).not.toContain('.bottomNav');
  });

  it('nao depende do toggle global para o tema inicial do shell', () => {
    const source = readFileSync(listSourcePath, 'utf8');

    expect(source).toContain('data-theme="light"');
    expect(source).toContain('data-public-cargas-mobile="true"');
    expect(source).not.toContain('PublicCargasMobileBottomNav');
    expect(source).toContain('PublicCargoActionSheet');
    expect(source).toContain('cargoDsV2ThemeRootClassName');
    expect(source).not.toContain('useTheme(');
  });

  it('nao renderiza filtros horizontais de status abaixo da search', () => {
    const source = readFileSync(listSourcePath, 'utf8');

    expect(source).not.toContain('statusScroller');
    expect(source).not.toContain('FilterChip');
  });

  it('usa placeholder publicMobileSearchPlaceholder da lista publica', () => {
    const source = readFileSync(listSourcePath, 'utf8');

    expect(source).toContain("tBoard('list.publicMobileSearchPlaceholder')");
    expect(source).not.toContain("tBoard('list.searchPlaceholder')");
  });

  it('renderiza CTA Ver rota e abre sheet light ao clicar no card', () => {
    const html = renderToStaticMarkup(
      <PublicCargasMobileList
        {...baseProps}
        filteredCargoes={[mockCargo]}
      />,
    );

    expect(html).toContain('operationsBoard.list.cardActionRoute');
    expect(html).not.toContain('operationsBoard.list.cardActionView');
    expect(html).toContain('role="button"');
    expect(html).toContain('data-cargo-id="CRG-7845"');
    expect(html).not.toContain('statusScroller');
    expect(html).toContain('placeholder="operationsBoard.list.publicMobileSearchPlaceholder"');
  });
});

describe('PublicCargasMobileList action sheet (source)', () => {
  it('sheet publico usa variant light, BottomSheet shared e acoes mapeadas', () => {
    const sheetSource = readFileSync(
      resolve(
        process.cwd(),
        'src/features/cargo/components/public-cargas-mobile/public-cargo-action-sheet.tsx',
      ),
      'utf8',
    );

    expect(sheetSource).toContain("from '@/shared/components/bottom-sheet'");
    expect(sheetSource).toContain('variant="light"');
    expect(sheetSource).toContain('overlayVariant="light"');
    expect(sheetSource).toContain('viewportAnchor="flush"');
    expect(sheetSource).toContain('PublicCargoActionSheetContent');
    expect(sheetSource).toContain('usePublicCargoLightSheetPortal');
    expect(sheetSource).toContain('publicCargoLightSheetDefaults');
  });

  it('conteúdo público expõe ações mapeadas sem duplicar header', () => {
    const contentSource = readFileSync(
      resolve(
        process.cwd(),
        'src/features/cargo/components/public-cargas-mobile/public-cargo-action-sheet-content.tsx',
      ),
      'utf8',
    );

    expect(contentSource).toContain('getPublicCargoActionRoutes');
    expect(contentSource).toContain('publicActionSheet.documentsTitle');
    expect(contentSource).toContain('publicActionSheet.costsTitle');
    expect(contentSource).toContain('publicActionSheet.priorityTitle');
    expect(contentSource).toContain('publicActionSheet.negotiationsTitle');
    expect(contentSource).toContain('data-public-cargo-action="true"');
    expect(contentSource).toContain('styles.summaryTitle');
  });

  it('CTA Ver rota navega direto para mapa sem abrir sheet antigo', () => {
    const listSource = readFileSync(listSourcePath, 'utf8');

    expect(listSource).toContain('primaryActionHref={intlAppPaths.cargos.cargoMap(labCargo.id)}');
    expect(listSource).toContain("tBoard('list.cardActionRoute')");
  });
});
