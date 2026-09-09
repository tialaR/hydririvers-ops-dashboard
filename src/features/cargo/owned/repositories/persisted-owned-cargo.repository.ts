import 'server-only';

import type { Cargo, CargoStatus, Negotiation } from '@/features/marketplace/domain/marketplace.types';
import type { OwnedCargoRepository } from '@/features/cargo/owned/domain/owned-cargo-repository';
import type {
  CargoCorridorId,
  CargoDocument,
  CargoOffer,
  OwnedCargo,
  OwnedCargoRiskLevel,
  OwnedCargoStatus,
} from '@/features/cargo/owned/domain/owned-cargo-types';
import {
  OWNED_CARGO_COCKPIT_METRICS,
  OWNED_CARGO_COCKPIT_TREND,
} from '@/features/cargo/owned/mocks/owned-cargo.mock';
import { readMock } from '@/shared/server/mock-db';

function ownsCargo(cargo: Cargo, ownerId: string) {
  return cargo.ownerId === ownerId || cargo.shipperId === ownerId;
}

function toStatus(status: CargoStatus): OwnedCargoStatus {
  if (status === 'delivered') return 'delivered';
  if (status === 'boarded') return 'inTransit';
  if (status === 'contracting' || status === 'reserved') return 'attention';
  return 'open';
}

function toRiskLevel(cargo: Cargo): OwnedCargoRiskLevel {
  if ((cargo.documentReadiness ?? 100) < 50) return 'high';
  if ((cargo.operationalRisks?.length ?? 0) > 0 || (cargo.documentReadiness ?? 100) < 80) return 'medium';
  return 'low';
}

function toCorridorId(cargo: Cargo): CargoCorridorId {
  const route = `${cargo.corridor ?? ''} ${cargo.mainRiver ?? ''}`.toLowerCase();
  if (route.includes('madeira') || route.includes('porto velho')) return 'madeira';
  if (route.includes('tapaj')) return 'tapajos';
  if (route.includes('tocant') || route.includes('aragua')) return 'tocantins-araguaia';
  return 'amazonas-solimoes';
}

function cargoCode(id: string) {
  if (id.startsWith('cargo-')) return `HR-${id.slice(6).padStart(4, '0')}`;
  if (id.startsWith('mock-')) return `HR-${id.slice(-6)}`;
  return id.toUpperCase();
}

function relatedNegotiations(cargo: Cargo, negotiations: Negotiation[]) {
  return negotiations.filter(
    (negotiation) =>
      negotiation.cargoId === cargo.id ||
      (!negotiation.cargoId && negotiation.cargoTitle === cargo.title),
  );
}

function toOwnedCargo(cargo: Cargo, negotiations: Negotiation[]): OwnedCargo {
  const pendingDocsCount =
    cargo.requiredDocuments?.filter((document) => document.status !== 'ok' && document.status !== 'nextPhase').length ?? 0;

  return {
    id: cargo.id,
    code: cargoCode(cargo.id),
    corridorId: toCorridorId(cargo),
    origin: cargo.origin,
    destination: cargo.destination,
    status: toStatus(cargo.status),
    riskLevel: toRiskLevel(cargo),
    freshnessMinutes: 0,
    freshnessState: 'fresh',
    etaHours: Number(cargo.etaConfidence?.match(/\d+/)?.[0] ?? 36),
    offersCount: relatedNegotiations(cargo, negotiations).length,
    pendingDocsCount,
  };
}

function findOwnedCargo(id: string, ownerId: string) {
  return readMock('cargoes').find((cargo) => cargo.id === id && ownsCargo(cargo, ownerId));
}

function toDocumentStatus(status: NonNullable<Cargo['requiredDocuments']>[number]['status']): CargoDocument['status'] {
  if (status === 'ok' || status === 'nextPhase') return 'ok';
  if (status === 'conditional') return 'expiring';
  return 'blocked';
}

function offerFromNegotiation(negotiation: Negotiation, index: number): CargoOffer {
  return {
    id: negotiation.id,
    labelKey: index === 0 ? 'offerA' : index === 1 ? 'offerB' : 'offerC',
    partnerKey: index === 0 ? 'partnerA' : index === 1 ? 'partnerB' : 'partnerC',
    etaHours: Number(negotiation.estimatedTime?.match(/\d+/)?.[0] ?? 36 + index * 4),
    pricePerTonLabel: negotiation.amount,
    recommended: index === 0,
  };
}

export const persistedOwnedCargoRepository: OwnedCargoRepository = {
  async listOwnedCargoes(ownerId) {
    const negotiations = readMock('negotiations');
    return readMock('cargoes')
      .filter((cargo) => ownsCargo(cargo, ownerId))
      .map((cargo) => toOwnedCargo(cargo, negotiations));
  },
  async getOwnedCargoById(id, ownerId) {
    const cargo = findOwnedCargo(id, ownerId);
    return cargo ? toOwnedCargo(cargo, readMock('negotiations')) : undefined;
  },
  async getOwnedCargoMapData(id, ownerId) {
    return this.getOwnedCargoById(id, ownerId);
  },
  async getDocumentsForCargo(cargoId, ownerId) {
    const cargo = findOwnedCargo(cargoId, ownerId);
    return (cargo?.requiredDocuments ?? []).map((document, index) => ({
      id: `${cargoId}-document-${index}`,
      nameKey: 'manifest',
      name: document.name,
      status: toDocumentStatus(document.status),
      dueLabelKey: document.status === 'required' ? 'blocking' : undefined,
    }));
  },
  async getOffersForCargo(cargoId, ownerId) {
    const cargo = findOwnedCargo(cargoId, ownerId);
    if (!cargo) return [];
    return relatedNegotiations(cargo, readMock('negotiations')).map(offerFromNegotiation);
  },
  async getCockpitMetrics() { return OWNED_CARGO_COCKPIT_METRICS; },
  async getCockpitTrend() { return OWNED_CARGO_COCKPIT_TREND; },
  async getDefaultCargoId() { return 'cargo-001'; },
};
