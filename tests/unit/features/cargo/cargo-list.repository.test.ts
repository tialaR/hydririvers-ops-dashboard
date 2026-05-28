import { describe, expect, it, vi } from 'vitest';

const mockGetPublicCargos = vi.hoisted(() => vi.fn());
const mockGetCargoById = vi.hoisted(() => vi.fn());
const mockBuildVisualCargoPool = vi.hoisted(() => vi.fn());

vi.mock('@/features/cargo/services/cargo.service', () => ({
  getPublicCargos: mockGetPublicCargos,
  getCargoById: mockGetCargoById,
}));

vi.mock('@/features/cargo/data/build-visual-cargo-pool', () => ({
  buildVisualCargoPool: mockBuildVisualCargoPool,
}));

import { mockCargoListRepository } from '@/features/cargo/repositories/mock-cargo-list.repository';

describe('mockCargoListRepository', () => {
  it('retorna lista via pool visual', async () => {
    mockGetPublicCargos.mockResolvedValue([{ id: 'CARGO-001' }]);
    mockBuildVisualCargoPool.mockReturnValue([{ id: 'CARGO-001' }, { id: 'HYD-2026-00002' }]);

    const list = await mockCargoListRepository.listMobileCargoes();

    expect(mockGetPublicCargos).toHaveBeenCalledTimes(1);
    expect(mockBuildVisualCargoPool).toHaveBeenCalledWith([{ id: 'CARGO-001' }]);
    expect(list).toHaveLength(2);
  });

  it('expõe filtros padrão', async () => {
    const filters = await mockCargoListRepository.getCargoListFilters();
    expect(filters.chips.map((chip) => chip.id)).toEqual([
      'all',
      'open',
      'bidding',
      'contracting',
      'reserved',
      'boarded',
      'attention',
    ]);
  });

  it('resolve carga por id', async () => {
    mockGetCargoById.mockResolvedValue({ id: 'CARGO-001' });
    const cargo = await mockCargoListRepository.getCargoById('CARGO-001');
    expect(cargo?.id).toBe('CARGO-001');
  });
});
