import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MobileCargoListLabV2 } from '@/features/cargo/components/mobile-list-lab-v2/mobile-cargo-list-lab-v2';

const v2SourcePath = resolve(
  process.cwd(),
  'src/features/cargo/components/mobile-list-lab-v2/mobile-cargo-list-lab-v2.tsx',
);

let forcedSheetMode: 'filters' | 'cargo' | null = null;
let nullStateCallCount = 0;

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useEffect: (effect: () => void | (() => void)) => {
      const cleanup = effect();
      return typeof cleanup === 'function' ? cleanup : undefined;
    },
    useState: (initial: unknown) => {
      if (initial === null && forcedSheetMode) {
        nullStateCallCount += 1;
        if (nullStateCallCount === 1) {
          return [forcedSheetMode, vi.fn()] as const;
        }
      }
      return actual.useState(initial);
    },
  };
});

vi.mock('@/shared/components/bottom-sheet', () => ({
  BottomSheet: ({
    open,
    title,
    children,
    footer,
  }: {
    open: boolean;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
  }) =>
    open ? (
      <section data-testid="mock-bottom-sheet" data-title={title}>
        <h2>{title}</h2>
        {children}
        {footer}
      </section>
    ) : null,
}));

describe('MobileCargoListLabV2', () => {
  beforeEach(() => {
    forcedSheetMode = null;
    nullStateCallCount = 0;
  });

  it('renderiza a tela dev-v2 sem erro', () => {
    const html = renderToStaticMarkup(<MobileCargoListLabV2 />);

    expect(html).toContain('Cargas');
    expect(html).toContain('4 de 4 cargas');
    expect(html).toContain('Buscar cargas...');
    expect(html).toContain('CRG-7845');
    expect(html).toContain('CRG-3921');
    expect(html).toContain('CRG-7012');
    expect(html).toContain('CRG-4510');
  });

  it('abre o bottom sheet de filtros e mostra grupos principais', () => {
    forcedSheetMode = 'filters';

    const html = renderToStaticMarkup(<MobileCargoListLabV2 />);

    expect(html).toContain('data-testid="mock-bottom-sheet"');
    expect(html).toContain('data-title="Filtros"');
    expect(html).toContain('<h2>Filtros</h2>');
    expect(html).toContain('<h3>Status</h3>');
    expect(html).toContain('Origem');
    expect(html).toContain('Destino');
    expect(html).toContain('Tipo de carga');
    expect(html).toContain('Tipo de embarcação');
    expect(html).toContain('Disponibilidade / Data de corte');
    expect(html).toContain('Capacidade / Peso bruto');
    expect(html).toContain('Limpar filtros');
    expect(html).toContain('Ver cargas');
  });

  it('renderiza cards de carga e abre detalhe ao acionar o card', () => {
    const html = renderToStaticMarkup(<MobileCargoListLabV2 />);
    expect(html).toContain('Eletrônicos e componentes');
    expect(html).toContain('role="button"');

    const source = readFileSync(v2SourcePath, 'utf8');
    expect(source).toContain('onClick={() => onOpen(cargo)}');
    expect(source).toContain("setSheetMode('cargo')");
    expect(source).toContain('open={sheetMode === \'cargo\'}');
  });

  it('não aninha button dentro de button no card', () => {
    const source = readFileSync(v2SourcePath, 'utf8');
    const cargoCardStart = source.indexOf('function CargoCard');
    const cargoCardEnd = source.indexOf('function BottomNav');
    const cargoCardSource = source.slice(cargoCardStart, cargoCardEnd);

    expect(cargoCardSource).toContain('<article');
    expect(cargoCardSource).toContain('role="button"');
    expect(cargoCardSource).toContain('<span className={styles.cardAction}');
    expect(cargoCardSource).toContain('aria-hidden="true"');
    expect(cargoCardSource).not.toContain('<button');
  });

  it('"Limpar filtros" reseta filtros e fecha o sheet', () => {
    forcedSheetMode = 'filters';

    const html = renderToStaticMarkup(<MobileCargoListLabV2 />);
    expect(html).toContain('Limpar filtros');

    const source = readFileSync(v2SourcePath, 'utf8');
    expect(source).toContain('function clearFiltersAndClose()');
    expect(source).toContain('resetFilters();');
    expect(source).toContain('closeSheet();');
    expect(source).toContain('onReset={clearFiltersAndClose}');
    expect(source).toContain("scheduleAction('reset')");
  });

  it('"Ver cargas" fecha o sheet sem limpar filtros', () => {
    forcedSheetMode = 'filters';

    const html = renderToStaticMarkup(<MobileCargoListLabV2 />);
    expect(html).toContain('Ver cargas');

    const source = readFileSync(v2SourcePath, 'utf8');
    expect(source).toContain('onViewCargoes={closeSheet}');
    expect(source).toContain("scheduleAction('view')");
    expect(source).not.toContain('onViewCargoes={clearFiltersAndClose}');
  });
});

describe('MobileCargoListLabV2 source contracts', () => {
  it('abre filtros pelos botões dedicados no header e na busca', () => {
    const source = readFileSync(v2SourcePath, 'utf8');

    expect(source).toContain("setSheetMode('filters')");
    expect(source).toContain('open={sheetMode === \'filters\'}');
    expect(source).toContain('aria-label="Abrir filtros"');
    expect(source).toContain('aria-label="Visualizar filtros"');
  });

  it('usa mocks de filtros compartilhados para todos os grupos', () => {
    const source = readFileSync(v2SourcePath, 'utf8');

    expect(source).toContain('cargoStatusFilterOptions');
    expect(source).toContain('cargoOriginFilterOptions');
    expect(source).toContain('cargoDestinationFilterOptions');
    expect(source).toContain('cargoTypeFilterOptions');
    expect(source).toContain('cargoVesselTypeFilterOptions');
    expect(source).toContain('cargoCutoffFilterOptions');
    expect(source).toContain('cargoCapacityFilterOptions');
  });
});
