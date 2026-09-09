import type { HydroUser } from '@/features/auth/domain/auth.types';
import { canViewCargo } from '@/features/auth/domain/access-control';
import type { Cargo, Negotiation } from '@/features/marketplace/domain/marketplace.types';

/** Níveis mínimos de acesso mock para cargas — espelha separação `/cargas` vs `/minhas-cargas`. */
export type CargoVisibilityTier = 'public' | 'authenticated' | 'owner';

export type CargoVisibilityPolicyRule = {
  tier: CargoVisibilityTier;
  /** Requer sessão mock ativa. */
  requiresAuth: boolean;
  /** Requer vínculo owner/shipper/carrier (ou admin). */
  requiresOwnership: boolean;
};

export const CARGO_VISIBILITY_POLICY: Record<CargoVisibilityTier, CargoVisibilityPolicyRule> = {
  public: { tier: 'public', requiresAuth: false, requiresOwnership: false },
  authenticated: { tier: 'authenticated', requiresAuth: true, requiresOwnership: false },
  owner: { tier: 'owner', requiresAuth: true, requiresOwnership: true },
};

/** Tier mínimo exigido para ver a carga no mock atual. */
export function resolveCargoVisibilityTier(cargo: Cargo): CargoVisibilityTier {
  if (cargo.visibility === 'public') return 'public';
  return 'owner';
}

function isCargoOwnedByViewer(
  cargo: Cargo,
  viewer: HydroUser,
  negotiations: Negotiation[] = [],
): boolean {
  return canViewCargo(viewer, cargo, negotiations);
}

/**
 * Avalia se o viewer mock atende ao tier mínimo para a carga.
 * - `public`: qualquer pessoa (inclui vitrine `/cargas`).
 * - `authenticated`: sessão ativa; cargas privadas ainda exigem ownership.
 * - `owner`: vínculo com a carga (rota `/minhas-cargas`).
 */
export function canAccessCargoAtTier(
  cargo: Cargo,
  viewer: HydroUser | null | undefined,
  tier: CargoVisibilityTier,
  negotiations: Negotiation[] = [],
): boolean {
  const rule = CARGO_VISIBILITY_POLICY[tier];
  const cargoTier = resolveCargoVisibilityTier(cargo);

  if (cargoTier === 'public') {
    if (tier === 'public') return true;
    if (!viewer) return false;
    if (tier === 'authenticated') return true;
    return isCargoOwnedByViewer(cargo, viewer, negotiations);
  }

  if (!viewer) return false;
  if (tier === 'public') return false;
  if (tier === 'authenticated') return false;
  return isCargoOwnedByViewer(cargo, viewer, negotiations);
}

/** Tier efetivo que o viewer alcança para a carga (ou `null` se sem acesso). */
export function resolveViewerCargoAccessTier(
  cargo: Cargo,
  viewer: HydroUser | null | undefined,
  negotiations: Negotiation[] = [],
): CargoVisibilityTier | null {
  if (canAccessCargoAtTier(cargo, viewer, 'owner', negotiations)) {
    return isCargoOwnedByViewer(cargo, viewer!, negotiations) ? 'owner' : 'authenticated';
  }
  if (canAccessCargoAtTier(cargo, viewer, 'authenticated', negotiations)) return 'authenticated';
  if (canAccessCargoAtTier(cargo, viewer, 'public', negotiations)) return 'public';
  return null;
}
