import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { ShipmentCard } from '@/features/cargo/components/shipment-card/shipment-card';

const base = {
  code: '#HY-000-000',
  origin: { stateCode: 'AM', stateLabel: 'Amazonas', city: 'Manaus' },
  destination: { stateCode: 'PA', stateLabel: 'Pará', city: 'Santarém' },
  cargoLabel: 'Carga',
  cargoValue: 'Equipamentos eletrônicos',
  etaValue: '08:45',
  etaSuffix: 'Hoje',
};

describe('ShipmentCard canonical contract', () => {
  it.each([
    ['Atrasada', 'delayed'],
    ['Em trânsito', 'inTransit'],
    ['Entregue', 'completed'],
    ['Aberta', 'open'],
    ['Bloqueada', 'blocked'],
  ] as const)('expõe variante semântica %s -> %s', (statusLabel, statusTone) => {
    const html = renderToStaticMarkup(createElement(ShipmentCard, {
      ...base,
      statusLabel,
      statusTone,
    }));

    expect(html).toContain(`data-status-tone="${statusTone}"`);
    expect(html).toContain(`data-tone="${statusTone}"`);
    expect(html).toContain(statusLabel);
  });

  it('congela as duas marcas estaduais usadas no blueprint atual', () => {
    const html = renderToStaticMarkup(createElement(ShipmentCard, {
      ...base,
      statusLabel: 'Em trânsito',
      statusTone: 'inTransit',
    }));

    expect(html).toContain('data-state-code="AM"');
    expect(html).toContain('aria-label="Amazonas"');
    expect(html).toContain('data-state-code="PA"');
    expect(html).toContain('aria-label="Pará"');
  });
});
