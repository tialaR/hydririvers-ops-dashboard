import { readMock } from '@/shared/server/mock-db';
import { normalizeCargoIdForLookup } from '@/shared/routing/normalize-cargo-id';
import type { UserRole } from '@/features/auth/domain/auth.types';
import type { Cargo } from '@/features/marketplace/domain/marketplace.types';
import { mergeCanonicalPublicCargo } from '@/features/cargo/constants/merge-canonical-public-cargo';
import { PUBLIC_MARKETPLACE_CARGO_IDS } from '@/features/cargo/constants/public-marketplace-cargos';
import { findVisualCargoById } from '@/features/cargo/data/build-visual-cargo-pool';
import {
  findPublicMarketplaceCargo,
  resolvePublicMarketplaceCargoList,
} from '@/features/cargo/data/resolve-public-marketplace-cargo-list';
import { publicCargosMock } from '@/features/cargo/mocks/publicCargos.mock';
import { carrier2CargosMock, carrierCargosMock, shipper2CargosMock, userCargosMock } from '@/features/my-cargos/mocks/myCargos.mock';

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
  return resolvePublicMarketplaceCargoList(cargoes);
}

/** IDs exibidos na lista pública — espelha `getPublicCargos()`. */
export { PUBLIC_MARKETPLACE_CARGO_IDS };

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
  const canonicalPublic = publicCargosMock.find(
    (cargo) => normalizeCargoIdForLookup(cargo.id) === normalizedId,
  );

  const publicList = resolvePublicMarketplaceCargoList(cargoes);
  const visualCargo = findVisualCargoById(id, publicList);
  const marketplaceCargo = findPublicMarketplaceCargo(id, cargoes);

  if (canonicalPublic) {
    const stored = cargoes.find((cargo) => normalizeCargoIdForLookup(cargo.id) === normalizedId);
    const merged = stored
      ? mergeCanonicalPublicCargo(stored, canonicalPublic)
      : { ...canonicalPublic };

    if (visualCargo && normalizeCargoIdForLookup(visualCargo.id) === normalizedId) {
      return mergeCanonicalPublicCargo(visualCargo, merged);
    }

    return merged;
  }

  if (visualCargo) {
    const canonical = publicCargosMock.find(
      (cargo) => normalizeCargoIdForLookup(cargo.id) === normalizedId,
    );
    if (canonical) {
      return mergeCanonicalPublicCargo(visualCargo, canonical);
    }
    return visualCargo;
  }

  if (marketplaceCargo) {
    return marketplaceCargo;
  }

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
