import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import {
  CargoFilterSheetContent,
  CargoFilterSheetFooter,
} from '@/features/cargo/components/cargo-filter-sheet-content';

describe('CargoFilterSheetContent', () => {
  it('renderiza grupos principais de filtro', () => {
    const html = renderToStaticMarkup(
      <CargoFilterSheetContent
        status="todos"
        cargoType="todos"
        origin="todos"
        destination="todos"
        vesselType="todos"
        cutoff="todos"
        capacity="todos"
        onStatusChange={() => undefined}
        onCargoTypeChange={() => undefined}
        onOriginChange={() => undefined}
        onDestinationChange={() => undefined}
        onVesselTypeChange={() => undefined}
        onCutoffChange={() => undefined}
        onCapacityChange={() => undefined}
      />,
    );

    expect(html).toContain('<h3>Status</h3>');
    expect(html).toContain('Origem');
    expect(html).toContain('Destino');
    expect(html).toContain('Tipo de carga');
    expect(html).toContain('Tipo de embarcação');
  });
});

describe('CargoFilterSheetFooter', () => {
  it('renderiza ações de limpar e ver cargas', () => {
    const html = renderToStaticMarkup(
      <CargoFilterSheetFooter onReset={() => undefined} onViewCargoes={() => undefined} />,
    );

    expect(html).toContain('Limpar filtros');
    expect(html).toContain('Ver cargas');
  });

  it('expõe scheduleAction com delay de 160ms no source', async () => {
    const { readFileSync } = await import('node:fs');
    const { resolve } = await import('node:path');
    const source = readFileSync(
      resolve(
        process.cwd(),
        'src/features/cargo/components/cargo-filter-sheet-content/CargoFilterSheetContent.tsx',
      ),
      'utf8',
    );

    expect(source).toContain('}, 160);');
    expect(source).toContain("scheduleAction('reset')");
    expect(source).toContain("scheduleAction('view')");
  });
});
