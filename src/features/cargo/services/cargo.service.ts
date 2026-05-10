import { readMock } from '@/shared/server/mock-db';
import type { Cargo } from '@/features/marketplace/domain/marketplace.types';
import { publicCargosMock } from '@/features/cargo/mocks/publicCargos.mock';
import { userCargosMock } from '@/features/my-cargos/mocks/myCargos.mock';
import { isPublicCargo } from '@/features/marketplace/services/cargo-visibility';

export async function getPublicCargos(): Promise<Cargo[]> {
  const cargoes = readMock('cargoes') as Cargo[];
  const publicCargoes = cargoes.filter((cargo) => isPublicCargo(cargo));
  return publicCargoes.length ? publicCargoes : publicCargosMock;
}

export async function getCurrentUserCargos(userId: string): Promise<Cargo[]> {
  const cargoes = readMock('cargoes') as Cargo[];
  const ownedCargoes = cargoes.filter((cargo) => cargo.ownerId === userId || cargo.shipperId === userId || cargo.carrierId === userId);
  if (ownedCargoes.length) return ownedCargoes;

  if (userId === 'u-shipper-1') return userCargosMock;
  return [];
}

export async function getCurrentUserCargoById(userId: string, cargoId: string): Promise<Cargo | undefined> {
  const cargoes = await getCurrentUserCargos(userId);
  return cargoes.find((cargo) => cargo.id === cargoId);
}

export const getMyCargos = getCurrentUserCargos;

export async function getCargoById(id: string): Promise<Cargo | undefined> {
  const cargoes = readMock('cargoes') as Cargo[];
  return cargoes.find((cargo) => cargo.id === id) ?? publicCargosMock.find((cargo) => cargo.id === id) ?? userCargosMock.find((cargo) => cargo.id === id);
}
