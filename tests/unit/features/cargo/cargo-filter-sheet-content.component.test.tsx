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

    expect(html).toContain('>Status</h3>');
    expect(html).toContain('Origem');
    expect(html).toContain('Destino');
    expect(html).toContain('Tipo de carga');
    expect(html).toContain('Tipo de embarcação');
    expect(html.match(/role="group"/g)).toHaveLength(7);
    expect(html.match(/aria-labelledby=/g)).toHaveLength(14);
    expect(html.match(/aria-pressed="true"/g)).toHaveLength(7);
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

  it('expõe scheduleAction com delay nomeado de 160ms no source', async () => {
    const { readFileSync } = await import('node:fs');
    const { resolve } = await import('node:path');
    const source = readFileSync(
      resolve(
        process.cwd(),
        'src/features/cargo/components/cargo-filter-sheet-content/cargo-filter-sheet-content.tsx',
      ),
      'utf8',
    );

    expect(source).toContain('const FILTER_ACTION_DELAY_MS = 160;');
    expect(source).toContain('}, FILTER_ACTION_DELAY_MS);');
    expect(source).toContain("scheduleAction('reset')");
    expect(source).toContain("scheduleAction('view')");
  });
});
