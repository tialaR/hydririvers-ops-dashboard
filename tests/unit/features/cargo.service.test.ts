import { describe, expect, it, vi, beforeEach } from 'vitest';

const mockReadMock = vi.hoisted(() => vi.fn());

vi.mock('@/shared/server/mock-db', () => ({
  readMock: mockReadMock
}));

import {
  canUserViewPrivateCargo,
  getCurrentUserCargoById,
  getCurrentUserCargos,
  getMyCargoesForUser
} from '@/features/cargo/services/cargo.service';
import { carrier2CargosMock, carrierCargosMock, shipper2CargosMock, userCargosMock } from '@/features/cargo/mocks/owned-cargos.mock';

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

  it('retorna cargas atribuídas ao transportador', async () => {
    mockReadMock.mockReturnValue([
      { id: 'a', ownerId: 'u-shipper-1' },
      { id: 'b', carrierId: 'u-carrier-1' },
      { id: 'c', carrierId: 'u-carrier-2' }
    ]);

    await expect(getCurrentUserCargos('u-carrier-1')).resolves.toEqual([{ id: 'b', carrierId: 'u-carrier-1' }]);
  });

  it('usa massa mock determinística quando não há cargoes no mock-db', async () => {
    mockReadMock.mockReturnValue([]);

    await expect(getCurrentUserCargos('u-shipper-1')).resolves.toEqual(userCargosMock);
    await expect(getCurrentUserCargos('u-carrier-1')).resolves.toEqual(carrierCargosMock);
    await expect(getCurrentUserCargos('u-shipper-2')).resolves.toEqual(shipper2CargosMock);
    await expect(getCurrentUserCargos('u-carrier-2')).resolves.toEqual(carrier2CargosMock);
    await expect(getCurrentUserCargos('u-shipper-x', 'shipper')).resolves.toSatisfy((cargoes: any[]) => cargoes.length > 0);
    await expect(getCurrentUserCargos('u-carrier-x', 'carrier')).resolves.toSatisfy((cargoes: any[]) => cargoes.length > 0);
    await expect(getCurrentUserCargos('u-other')).resolves.toEqual([]);
    await expect(getCurrentUserCargos('u-other', 'shipper')).resolves.toSatisfy((cargoes: any[]) => cargoes.length > 0);
  });

  it('getMyCargoesForUser espelha getCurrentUserCargos', async () => {
    mockReadMock.mockReturnValue([]);
    await expect(getMyCargoesForUser('u-shipper-1')).resolves.toEqual(userCargosMock);
  });

  it('canUserViewPrivateCargo reconhece vínculo por owner/shipper/carrier', () => {
    expect(canUserViewPrivateCargo({ id: 'u-1', role: 'shipper' }, { id: 'x', ownerId: 'u-1' } as any)).toBe(true);
    expect(canUserViewPrivateCargo({ id: 'u-1', role: 'shipper' }, { id: 'x', ownerId: 'u-2' } as any)).toBe(false);
    expect(canUserViewPrivateCargo({ id: 'adm', role: 'admin' }, { id: 'x', ownerId: 'u-2' } as any)).toBe(true);
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
