import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { MobileCargoLabEmptyState } from '@/features/cargo/components/mobile-list-lab/mobile-cargo-list-lab';

describe('CargoLabEmptyState', () => {
  it('aparece com ação de limpar', () => {
    const html = renderToStaticMarkup(
      <MobileCargoLabEmptyState
        title="Nenhum resultado"
        description="Ajuste os filtros"
        clearLabel="Limpar filtros"
        onClear={() => undefined}
      />,
    );

    expect(html).toContain('Nenhum resultado');
    expect(html).toContain('Limpar filtros');
  });
});

describe('MobileCargoListLab search/filter integration', () => {
  it('empty state copy é renderizável sem globals.scss', () => {
    const html = renderToStaticMarkup(
      <MobileCargoLabEmptyState
        title="Sem cargas"
        description="Tente novamente"
        clearLabel="Limpar"
        onClear={vi.fn()}
      />,
    );

    expect(html).not.toContain('hr-cargo-card');
    expect(html).toContain('Sem cargas');
  });
});
