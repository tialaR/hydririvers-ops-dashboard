import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { CargoRouteLine } from '@/features/cargo/components/cargo-route-line';

describe('CargoRouteLine', () => {
  it('renderiza origem e destino no variant card', () => {
    const html = renderToStaticMarkup(
      <CargoRouteLine originLabel="Belém, PA" destinationLabel="Santarém, PA" />,
    );

    expect(html).toContain('Belém, PA');
    expect(html).toContain('Santarém, PA');
    expect(html).toContain('data-tone="origin"');
    expect(html).toContain('data-tone="destination"');
    expect(html).toContain('aria-label="Belém, PA → Santarém, PA"');
    expect(html).toContain('data-variant="card"');
    expect(html).toContain('<svg');
  });

  it('renderiza metadados no variant sheet', () => {
    const html = renderToStaticMarkup(
      <CargoRouteLine
        variant="sheet"
        originLabel="Belém, PA"
        destinationLabel="Santarém, PA"
        originMeta="Porto de Belém"
        destinationMeta="Terminal Fluvial de Santarém"
      />,
    );

    expect(html).toContain('Porto de Belém');
    expect(html).toContain('Terminal Fluvial de Santarém');
    expect(html).toContain('role="group"');
    expect(html).toContain('data-variant="sheet"');
  });

  it('aceita um nome acessível contextualizado pelo consumidor', () => {
    const html = renderToStaticMarkup(
      <CargoRouteLine
        originLabel="Belém, PA"
        destinationLabel="Santarém, PA"
        ariaLabel="Trecho operacional de Belém para Santarém"
      />,
    );

    expect(html).toContain('aria-label="Trecho operacional de Belém para Santarém"');
  });
});
