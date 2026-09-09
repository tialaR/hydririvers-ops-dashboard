import type { HydroUser } from '@/features/auth/domain/auth.types';
import { canViewCargo } from '@/features/auth/domain/access-control';
import type { Cargo, Negotiation } from '@/features/marketplace/domain/marketplace.types';
import { cargoMatchesCarrier, cargoMatchesShipper } from './my-cargoes.filters';

export type CargoScope = 'public' | 'mine' | 'operational';

function inferCargoVisibility(cargo: Cargo): 'public' | 'private' {
  if (cargo.visibility === 'public') return 'public';
  if (cargo.visibility === 'private' || cargo.visibility === 'restricted') return 'private';
  if (cargo.publishedAt) return 'public';
  return cargo.status === 'open' || cargo.status === 'bidding' || cargo.status === 'reserved' || cargo.status === 'boarded'
    ? 'public'
    : 'private';
}

export function isPublicCargo(cargo: Cargo) {
  return inferCargoVisibility(cargo) === 'public';
}

export function isCargoOwnedByUser(cargo: Cargo, currentUser: HydroUser | null | undefined, negotiations: Negotiation[] = []) {
  if (!currentUser) return false;
  if (currentUser.role === 'shipper') {
    return cargoMatchesShipper(currentUser.id, cargo, negotiations);
  }
  if (currentUser.role === 'carrier') {
    return cargoMatchesCarrier(currentUser.id, cargo, negotiations);
  }
  return cargo.ownerId === currentUser.id || cargo.shipperId === currentUser.id || cargo.carrierId === currentUser.id;
}

export function canUserSeeCargo(cargo: Cargo, currentUser: HydroUser | null | undefined, negotiations: Negotiation[] = []) {
  return canViewCargo(currentUser, cargo, negotiations) || isPublicCargo(cargo);
}

export function getDashboardCargos(cargoes: Cargo[], currentUser?: HydroUser | null) {
  const _user = currentUser;
  return cargoes.filter((cargo) => isPublicCargo(cargo));
}

export function getMyCargos(cargoes: Cargo[], currentUser: HydroUser | null | undefined, negotiations: Negotiation[] = []) {
  if (!currentUser) return [];
  if (currentUser.role === 'admin') return cargoes.filter((cargo) => cargo.ownerId === currentUser.id || cargo.shipperId === currentUser.id);
  return cargoes.filter((cargo) => isCargoOwnedByUser(cargo, currentUser, negotiations));
}

export function getOperationalCargoes(cargoes: Cargo[], currentUser: HydroUser | null | undefined, negotiations: Negotiation[] = []) {
  if (!currentUser) return getDashboardCargos(cargoes, null);
  if (currentUser.role === 'admin') return getDashboardCargos(cargoes, currentUser);
  return cargoes.filter((cargo) => canUserSeeCargo(cargo, currentUser, negotiations));
}

export function getScopedCargoes(
  scope: CargoScope,
  cargoes: Cargo[],
  currentUser: HydroUser | null | undefined,
  negotiations: Negotiation[] = []
) {
  if (scope === 'mine') return getMyCargos(cargoes, currentUser, negotiations);
  if (scope === 'operational') return getOperationalCargoes(cargoes, currentUser, negotiations);
  return getDashboardCargos(cargoes, currentUser);
}
