import type { Cargo, CargoStatus } from '@/features/marketplace/domain/marketplace.types';

/** Limite abaixo do qual documentação conta como pendência operacional. */
export const OWNED_CARGO_PENDING_READINESS_THRESHOLD = 72;

export type OwnedCargoesSummary = {
  active: number;
  proposals: number;
  pending: number;
  inTransit: number;
};

export const OWNED_CARGO_STATUS_PROGRESS: Record<CargoStatus, number> = {
  open: 18,
  bidding: 42,
  contracting: 58,
  reserved: 72,
  boarded: 88,
  delivered: 100,
};

export function ownedCargoHasDocumentPendency(cargo: Cargo): boolean {
  const readiness = cargo.documentReadiness ?? 100;
  const docPending = cargo.requiredDocuments?.some((document) => document.status === 'required') ?? false;
  const incompleteRegistration = !cargo.publishedAt && cargo.status === 'open';
  return readiness < OWNED_CARGO_PENDING_READINESS_THRESHOLD || incompleteRegistration || docPending;
}

export function summarizeOwnedCargoes(items: Cargo[]): OwnedCargoesSummary {
  let active = 0;
  let proposals = 0;
  let pending = 0;
  let inTransit = 0;

  for (const cargo of items) {
    if (cargo.status !== 'delivered') active += 1;
    proposals += typeof cargo.proposalsCount === 'number' ? cargo.proposalsCount : 0;
    if (ownedCargoHasDocumentPendency(cargo)) pending += 1;
    if (cargo.status === 'boarded') inTransit += 1;
  }

  return { active, proposals, pending, inTransit };
}

export function resolveOwnedCargoProgress(cargo: Cargo): number {
  if (typeof cargo.documentReadiness === 'number') {
    return Math.max(0, Math.min(100, cargo.documentReadiness));
  }

  return OWNED_CARGO_STATUS_PROGRESS[cargo.status];
}
