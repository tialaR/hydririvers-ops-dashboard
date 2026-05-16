import { readMock } from '@/shared/server/mock-db';
import { normalizeCargoIdForLookup } from '@/shared/routing/normalize-cargo-id';
import type { UserRole } from '@/features/auth/domain/auth.types';
import type { Cargo } from '@/features/marketplace/domain/marketplace.types';
import { publicCargosMock } from '@/features/cargo/mocks/publicCargos.mock';
import { carrier2CargosMock, carrierCargosMock, shipper2CargosMock, userCargosMock } from '@/features/my-cargos/mocks/myCargos.mock';
import { isPublicCargo } from '@/features/marketplace/services/cargo-visibility';

function cloneAsShipper(cargoes: Cargo[], userId: string) {
  return cargoes.map((cargo) => ({ ...cargo, ownerId: userId, shipperId: userId, visibility: 'private' as const }));
}

function cloneAsCarrier(cargoes: Cargo[], userId: string) {
  return cargoes.map((cargo) => ({ ...cargo, carrierId: userId, visibility: 'private' as const }));
}

function fallbackMyCargoesDeck(userId: string, role?: UserRole): Cargo[] {
  if (userId === 'u-shipper-1') return userCargosMock;
  if (userId === 'u-shipper-2') return shipper2CargosMock;
  if (userId === 'u-carrier-1') return carrierCargosMock;
  if (userId === 'u-carrier-2') return carrier2CargosMock;
  if (role === 'shipper') return cloneAsShipper(userCargosMock, userId);
  if (role === 'carrier') return cloneAsCarrier(carrierCargosMock, userId);
  return [];
}

export async function getPublicCargos(): Promise<Cargo[]> {
  const cargoes = readMock('cargoes') as Cargo[];
  const publicCargoes = cargoes.filter((cargo) => isPublicCargo(cargo));
  return publicCargoes.length ? publicCargoes : publicCargosMock;
}

/** Alias alinhado ao vocabulário de domínio (pt). */
export const getPublicCargoes = getPublicCargos;

export async function getPublicCargoById(id: string): Promise<Cargo | undefined> {
  const list = await getPublicCargos();
  return list.find((cargo) => cargo.id === id);
}

export async function getCurrentUserCargos(userId: string, role?: UserRole): Promise<Cargo[]> {
  const cargoes = readMock('cargoes') as Cargo[];
  const ownedCargoes = cargoes.filter((cargo) => cargo.ownerId === userId || cargo.shipperId === userId || cargo.carrierId === userId);
  if (ownedCargoes.length > 0) {
    return ownedCargoes;
  }

  return fallbackMyCargoesDeck(userId, role);
}

export async function getMyCargoesForUser(userId: string, role?: UserRole): Promise<Cargo[]> {
  return getCurrentUserCargos(userId, role);
}

export async function getMyCargoByIdForUser(cargoId: string, userId: string, role?: UserRole): Promise<Cargo | undefined> {
  const cargoes = await getCurrentUserCargos(userId, role);
  return cargoes.find((cargo) => cargo.id === cargoId);
}

export async function getCurrentUserCargoById(userId: string, cargoId: string, role?: UserRole): Promise<Cargo | undefined> {
  const cargoes = await getCurrentUserCargos(userId, role);
  return cargoes.find((cargo) => cargo.id === cargoId);
}

export function canUserViewPrivateCargo(user: { id: string; role?: UserRole }, cargo: Cargo): boolean {
  if (user.role === 'admin') return true;
  return cargo.ownerId === user.id || cargo.shipperId === user.id || cargo.carrierId === user.id;
}

export const getMyCargos = getCurrentUserCargos;

export async function getCargoById(id: string): Promise<Cargo | undefined> {
  const cargoes = readMock('cargoes') as Cargo[];
  const normalizedId = normalizeCargoIdForLookup(id);
  const allCargoes = [
    ...cargoes,
    ...publicCargosMock,
    ...userCargosMock,
    ...carrierCargosMock,
    ...shipper2CargosMock,
    ...carrier2CargosMock,
  ];

  return allCargoes.find((cargo) => normalizeCargoIdForLookup(cargo.id) === normalizedId);
}
