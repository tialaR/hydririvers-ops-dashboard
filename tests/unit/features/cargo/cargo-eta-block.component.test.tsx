import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { CargoEtaBlock } from '@/features/cargo/components/cargo-eta-block';

describe('CargoEtaBlock', () => {
  it('expõe a métrica compacta sem duplicar seu texto acessível', () => {
    const html = renderToStaticMarkup(<CargoEtaBlock label="ETA" value="18 set, 14:30" />);

    expect(html).toContain('<span>ETA</span><strong>18 set, 14:30</strong>');
    expect(html).not.toContain('aria-label="ETA: 18 set, 14:30"');
    expect(html).toContain('data-variant="card"');
  });

  it('renderiza métricas e tom semântico no variant sheet', () => {
    const html = renderToStaticMarkup(
      <CargoEtaBlock
        variant="sheet"
        ariaLabel="Previsões da operação"
        metrics={[
          { label: 'ETA', value: '18 set, 14:30' },
          { label: 'Entrega prevista', value: '19 set, 08:00', tone: 'success' },
        ]}
      />,
    );

    expect(html).toContain('role="group"');
    expect(html).toContain('aria-label="Previsões da operação"');
    expect(html).toContain('data-tone="success"');
    expect(html).toContain('data-variant="sheet"');
  });
});
