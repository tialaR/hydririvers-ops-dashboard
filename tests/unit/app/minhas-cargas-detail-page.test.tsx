import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockNotFound = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({
  notFound: mockNotFound
}));

vi.mock('@/features/shipper-mobile-flow/application/get-shipper-cargo-by-id', () => ({
  getShipperCargoById: vi.fn()
}));

vi.mock('@/features/shipper-mobile-flow/screens/cargo-detail-screen', () => ({
  CargoDetailScreen: ({ cargo }: { cargo: { id: string; code: string } }) => (
    <div data-testid="shipper-cargo-detail" data-id={cargo.id} data-code={cargo.code} />
  )
}));

import { getShipperCargoById } from '@/features/shipper-mobile-flow/application/get-shipper-cargo-by-id';
import MyCargoDetailPage from '@/app/[locale]/(shipper-mobile-flow)/minhas-cargas/[id]/page';

const cargo = {
  id: 'hr-4821',
  code: 'HR-4821',
  corridorId: 'madeira' as const,
  origin: 'Porto Velho',
  destination: 'Miritituba / Itaituba',
  status: 'attention' as const,
  riskLevel: 'high' as const,
  freshnessMinutes: 12,
  freshnessState: 'fresh' as const,
  etaHours: 15,
  offersCount: 3,
  pendingDocsCount: 1
};

describe('minhas-cargas/[id] page (shipper mobile flow)', () => {
  beforeEach(() => {
    mockNotFound.mockReset();
    vi.mocked(getShipperCargoById).mockReset();
  });

  it('renderiza detalhe quando a carga mock existe', async () => {
    vi.mocked(getShipperCargoById).mockResolvedValue(cargo);

    const tree = await MyCargoDetailPage({ params: Promise.resolve({ id: cargo.id }) });
    const html = renderToStaticMarkup(tree as React.ReactElement);

    expect(html).toContain('data-testid="shipper-cargo-detail"');
    expect(html).toContain('HR-4821');
    expect(mockNotFound).not.toHaveBeenCalled();
  });

  it('dispara notFound quando a carga não existe no mock', async () => {
    vi.mocked(getShipperCargoById).mockResolvedValue(undefined);
    mockNotFound.mockImplementation(() => {
      throw new Error('notFound');
    });

    await expect(MyCargoDetailPage({ params: Promise.resolve({ id: 'missing-id' }) })).rejects.toThrow('notFound');
  });
});
