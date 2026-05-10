import { describe, expect, it, vi, beforeEach } from 'vitest';

const mockReadMock = vi.hoisted(() => vi.fn());

vi.mock('@/shared/server/mock-db', () => ({
  readMock: mockReadMock
}));

import { getCurrentUserCargoById, getCurrentUserCargos } from '@/features/cargo/services/cargo.service';

describe('cargo.service', () => {
  beforeEach(() => {
    mockReadMock.mockReset();
  });

  it('retorna apenas cargas do usuário atual', async () => {
    mockReadMock.mockReturnValue([
      { id: 'a', ownerId: 'u-shipper-1' },
      { id: 'b', shipperId: 'u-shipper-1' },
      { id: 'c', carrierId: 'u-carrier-1' },
      { id: 'd', ownerId: 'u-other' }
    ]);

    await expect(getCurrentUserCargos('u-shipper-1')).resolves.toEqual([
      { id: 'a', ownerId: 'u-shipper-1' },
      { id: 'b', shipperId: 'u-shipper-1' }
    ]);
  });

  it('retorna a carga privada pelo id quando pertence ao usuário', async () => {
    mockReadMock.mockReturnValue([
      { id: 'a', ownerId: 'u-shipper-1' },
      { id: 'b', ownerId: 'u-other' }
    ]);

    await expect(getCurrentUserCargoById('u-shipper-1', 'a')).resolves.toEqual({ id: 'a', ownerId: 'u-shipper-1' });
    await expect(getCurrentUserCargoById('u-shipper-1', 'b')).resolves.toBeUndefined();
  });
});
