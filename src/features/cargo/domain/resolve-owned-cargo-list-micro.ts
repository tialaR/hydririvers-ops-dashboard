import type { Cargo } from '@/features/marketplace/domain/marketplace.types';
import { ownedCargoHasDocumentPendency } from '@/features/cargo/domain/summarize-owned-cargoes';

export type OwnedCargoListMicroKind = 'nextStep' | 'proposals' | 'documents' | 'track' | 'none';

export type OwnedCargoListMicro = {
  kind: OwnedCargoListMicroKind;
  /** Chave i18n em `pages.minhasCargas.ownedCard.micro.*` ou mock literal para nextStep. */
  messageKey?: 'proposals' | 'documents' | 'track' | 'inTransit';
  messageMock?: string;
  count?: number;
};

export function resolveOwnedCargoListMicro(cargo: Cargo): OwnedCargoListMicro {
  if (cargo.status === 'boarded') {
    return { kind: 'track', messageKey: 'inTransit' };
  }

  if (typeof cargo.proposalsCount === 'number' && cargo.proposalsCount > 0) {
    return { kind: 'proposals', messageKey: 'proposals', count: cargo.proposalsCount };
  }

  if (ownedCargoHasDocumentPendency(cargo)) {
    return { kind: 'documents', messageKey: 'documents' };
  }

  if (cargo.operationalNextStep?.trim()) {
    return { kind: 'nextStep', messageMock: cargo.operationalNextStep.trim() };
  }

  return { kind: 'none' };
}
