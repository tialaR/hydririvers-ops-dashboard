import type { OwnedCargoRepository } from '@/features/cargo/owned/domain/owned-cargo-repository';
import { DEFAULT_OWNED_CARGO_ID, OWNED_CARGO_COCKPIT_METRICS, OWNED_CARGO_COCKPIT_TREND, OWNED_CARGO_DOCUMENTS, OWNED_CARGO_OFFERS, OWNED_CARGOES } from '@/features/cargo/owned/mocks/owned-cargo.mock';

export const mockOwnedCargoRepository: OwnedCargoRepository = {
  async listOwnedCargoes(_ownerId) { return OWNED_CARGOES; },
  async getOwnedCargoById(id, _ownerId) { return OWNED_CARGOES.find((cargo) => cargo.id === id); },
  async getOwnedCargoMapData(id, _ownerId) { return OWNED_CARGOES.find((cargo) => cargo.id === id); },
  async getDocumentsForCargo(_cargoId, _ownerId) { return OWNED_CARGO_DOCUMENTS; },
  async getOffersForCargo(_cargoId, _ownerId) { return OWNED_CARGO_OFFERS; },
  async getCockpitMetrics() { return OWNED_CARGO_COCKPIT_METRICS; },
  async getCockpitTrend() { return OWNED_CARGO_COCKPIT_TREND; },
  async getDefaultCargoId() { return DEFAULT_OWNED_CARGO_ID; }
};
