import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockReadMock = vi.hoisted(() => vi.fn());

vi.mock('@/shared/server/mock-db', () => ({
  readMock: mockReadMock
}));

import { getOperationalDashboardSummary } from '@/features/marketplace/services/marketplace.service';

describe('marketplace.service operational summary', () => {
  beforeEach(() => {
    mockReadMock.mockReset();
    mockReadMock.mockImplementation((key: string) => {
      if (key === 'cargoes') {
        return [
          { id: 'cargo-1', title: 'Carga A', origin: 'Belém, PA', destination: 'Santarém, PA', status: 'open', documentReadiness: 72, corridor: 'Belém–Santarém', operationalRisks: ['Janela curta'] },
          { id: 'cargo-2', title: 'Carga B', origin: 'Manaus, AM', destination: 'Belém, PA', status: 'reserved', documentReadiness: 58, corridor: 'Manaus–Belém' },
          { id: 'cargo-3', title: 'Carga C', origin: 'Tefé, AM', destination: 'Manaus, AM', status: 'delivered', documentReadiness: 100, corridor: 'Tefé–Manaus' }
        ];
      }
      if (key === 'vessels') {
        return [{ id: 'v-1', status: 'available' }, { id: 'v-2', status: 'route' }];
      }
      if (key === 'negotiations') {
        return [{ id: 'n-1', cargoTitle: 'Carga A', vesselName: 'V1', stage: 'quote', amount: 'R$ 1', lastUpdate: '', parties: [] }];
      }
      return [];
    });
  });

  it('agrega dados operacionais sem depender da listagem principal de Cargas', async () => {
    const summary = await getOperationalDashboardSummary();

    expect(summary.activeCargoes).toBe(2);
    expect(summary.pendingDocuments).toBe(2);
    expect(summary.availableVessels).toBe(1);
    expect(summary.activeNegotiations).toBe(1);
    expect(summary.attentionCargoes).toHaveLength(2);
    expect(summary.attentionCargoes[0]?.id).toBe('cargo-2');
    expect(summary.busiestCorridors[0]?.corridor).toBe('Belém–Santarém');
    expect(summary.recentNegotiations).toHaveLength(1);
  });
});
