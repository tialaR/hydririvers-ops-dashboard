import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { CargoDetailSheetContent } from '@/features/cargo/components/cargo-detail-sheet-content';
import { CARGO_LAB_V2_MOCKS } from '@/features/cargo/data/cargo-lab-v2.mock';

const cargo = CARGO_LAB_V2_MOCKS[0];

describe('CargoDetailSheetContent', () => {
  it('renderiza dados principais da carga', () => {
    const html = renderToStaticMarkup(<CargoDetailSheetContent cargo={cargo} />);

    expect(html).toContain('CRG-7845');
    expect(html).toContain('Eletrônicos e componentes');
    expect(html).toContain('São Paulo, SP');
    expect(html).toContain('Manaus, AM');
    expect(html).toContain('Terminal Barra Funda');
    expect(html).toContain('Porto Chibatão');
    expect(html).toContain('ETA');
    expect(html).toContain('Entrega prevista');
  });

  it('renderiza seções de navegação da carga', () => {
    const html = renderToStaticMarkup(<CargoDetailSheetContent cargo={cargo} />);

    expect(html).toContain('Visão geral');
    expect(html).toContain('Jornada');
    expect(html).toContain('Documentos');
    expect(html).toContain('Custos');
    expect(html).toContain('Ações da carga');
    expect(html).toContain('role="group"');
    expect(html).toContain('aria-label="Seções da carga"');
    expect(html).toContain('aria-label="Abrir ações da carga CRG-7845"');
  });

  it('marca seção selecionada e chama callback', () => {
    const onSelectSection = vi.fn();
    const html = renderToStaticMarkup(
      <CargoDetailSheetContent
        cargo={cargo}
        selectedSection="journey"
        onSelectSection={onSelectSection}
      />,
    );

    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('data-selected="true"');
    expect(onSelectSection).not.toHaveBeenCalled();
  });
});
