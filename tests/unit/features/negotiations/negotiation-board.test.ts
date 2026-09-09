import { describe, expect, it } from 'vitest';
import { getNegotiationsSummary } from '@/features/negotiations/domain/negotiations-summary';
import type { Negotiation } from '@/features/marketplace/domain/marketplace.types';

function n(overrides: Partial<Negotiation>): Negotiation {
  return {
    id: 'n-1',
    cargoTitle: 'Açaí congelado',
    vesselName: 'Barco Marituba',
    route: 'Belém → Santarém',
    amount: '1000',
    stage: 'quote',
    lastUpdate: '2026-05-10T00:00:00.000Z',
    nextStep: 'Revisar',
    parties: ['shipper', 'carrier'],
    ...overrides
  };
}

describe('getNegotiationsSummary', () => {
  it('resume totais por etapa e valores', () => {
    const negotiations: Negotiation[] = [
      n({ id: 'n-1', stage: 'quote', amount: '1000' }),
      n({ id: 'n-2', stage: 'counteroffer', amount: '2000' }),
      n({ id: 'n-3', stage: 'contract', amount: '3000' })
    ];

    const summary = getNegotiationsSummary(negotiations);
    expect(summary.total).toBe(3);
    expect(summary.active).toBe(3);
    expect(summary.byStage.quote).toBe(1);
    expect(summary.byStage.counteroffer).toBe(1);
    expect(summary.byStage.contract).toBe(1);
    expect(summary.needsResponse).toBe(1);
    expect(summary.contractsInProgress).toBe(1);
    expect(summary.amountTotal).toBe('6000');
  });

  it('conta contratos em andamento e negociações ativas sem entregues', () => {
    const negotiations: Negotiation[] = [
      n({ id: 'n-1', stage: 'contract' }),
      n({ id: 'n-2', stage: 'boarding' }),
      n({ id: 'n-3', stage: 'delivered' })
    ];
    const summary = getNegotiationsSummary(negotiations);
    expect(summary.active).toBe(2);
    expect(summary.contractsInProgress).toBe(2);
    expect(summary.total).toBe(3);
  });
});
