import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { CargoCard } from '@/features/cargo/components/cargo-card';
import { CARGO_LAB_V2_MOCKS } from '@/features/cargo/data/cargo-lab-v2.mock';

const cargo = CARGO_LAB_V2_MOCKS[0];

describe('CargoCard', () => {
  it('renderiza código, título, origem, destino, status e ETA', () => {
    const html = renderToStaticMarkup(<CargoCard cargo={cargo} index={0} />);

    expect(html).toContain('CRG-7845');
    expect(html).toContain('Eletrônicos e componentes');
    expect(html).toContain('São Paulo, SP');
    expect(html).toContain('Manaus, AM');
    expect(html).toContain('Em trânsito');
    expect(html).toContain('ETA');
    expect(html).toContain('24 Mai, 14:00');
  });

  it('chama onClick ao acionar o card', () => {
    const onClick = vi.fn();
    renderToStaticMarkup(<CargoCard cargo={cargo} onClick={onClick} />);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renderiza CTA Acompanhar para carga em trânsito', () => {
    const html = renderToStaticMarkup(<CargoCard cargo={cargo} onClick={() => undefined} />);
    expect(html).toContain('Acompanhar');
  });

  it('renderiza CTA Ver detalhes para carga agendada', () => {
    const scheduled = CARGO_LAB_V2_MOCKS[1];
    const html = renderToStaticMarkup(<CargoCard cargo={scheduled} onClick={() => undefined} />);
    expect(html).toContain('Ver detalhes');
  });
});
