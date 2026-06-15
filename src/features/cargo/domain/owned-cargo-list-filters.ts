import type { Cargo } from '@/features/marketplace/domain/marketplace.types';
import {
  OWNED_CARGO_PENDING_READINESS_THRESHOLD,
  ownedCargoHasDocumentPendency,
} from '@/features/cargo/domain/summarize-owned-cargoes';

export const OWNED_CARGO_LIST_FILTER_IDS = [
  'all',
  'open',
  'inTransit',
  'documents',
  'risk',
] as const;

export type OwnedCargoListFilterId = (typeof OWNED_CARGO_LIST_FILTER_IDS)[number];

export type OwnedCargoListFilterCounts = Record<OwnedCargoListFilterId, number>;

/** Carga aberta para publicação ou recebimento de propostas. */
export function ownedCargoIsOpen(cargo: Cargo): boolean {
  return cargo.status === 'open';
}

/** Carga em trânsito operacional (embarcada). */
export function ownedCargoIsInTransit(cargo: Cargo): boolean {
  return cargo.status === 'boarded';
}

/** Risco operacional declarado no mock/domínio. */
export function ownedCargoHasRisk(cargo: Cargo): boolean {
  return (cargo.operationalRisks?.length ?? 0) > 0;
}

export function matchesOwnedCargoListFilter(
  cargo: Cargo,
  filterId: OwnedCargoListFilterId,
): boolean {
  switch (filterId) {
    case 'all':
      return true;
    case 'open':
      return ownedCargoIsOpen(cargo);
    case 'inTransit':
      return ownedCargoIsInTransit(cargo);
    case 'documents':
      return ownedCargoHasDocumentPendency(cargo);
    case 'risk':
      return ownedCargoHasRisk(cargo);
    default:
      return true;
  }
}

export function filterOwnedCargoesByListFilter(
  items: Cargo[],
  filterId: OwnedCargoListFilterId,
): Cargo[] {
  if (filterId === 'all') {
    return items;
  }

  return items.filter((cargo) => matchesOwnedCargoListFilter(cargo, filterId));
}

export function countOwnedCargoesByListFilter(items: Cargo[]): OwnedCargoListFilterCounts {
  let open = 0;
  let inTransit = 0;
  let documents = 0;
  let risk = 0;

  for (const cargo of items) {
    if (ownedCargoIsOpen(cargo)) open += 1;
    if (ownedCargoIsInTransit(cargo)) inTransit += 1;
    if (ownedCargoHasDocumentPendency(cargo)) documents += 1;
    if (ownedCargoHasRisk(cargo)) risk += 1;
  }

  return {
    all: items.length,
    open,
    inTransit,
    documents,
    risk,
  };
}

/** Reexport do limiar documental para testes e contratos de domínio. */
export { OWNED_CARGO_PENDING_READINESS_THRESHOLD };
