import {
  SHIPPER_COCKPIT_METRICS,
  SHIPPER_COCKPIT_TREND,
  SHIPPER_DEFAULT_CARGO_ID,
  SHIPPER_DOCUMENTS,
  SHIPPER_OFFERS,
  SHIPPER_OWNED_CARGOES
} from '@/features/shipper-mobile-flow/data/mock/shipper-cargo-mock';
import type { CargoRepository } from '@/features/shipper-mobile-flow/domain/repositories/cargo-repository';

export const mockCargoRepository: CargoRepository = {
  async listShipperCargoes() {
    return SHIPPER_OWNED_CARGOES;
  },

  async getShipperCargoById(id) {
    return SHIPPER_OWNED_CARGOES.find((cargo) => cargo.id === id);
  },

  async getCargoMapData(id) {
    return SHIPPER_OWNED_CARGOES.find((cargo) => cargo.id === id);
  },

  async getDocumentsForCargo(_cargoId) {
    return SHIPPER_DOCUMENTS;
  },

  async getOffersForCargo(_cargoId) {
    return SHIPPER_OFFERS;
  },

  async getCockpitMetrics() {
    return SHIPPER_COCKPIT_METRICS;
  },

  async getCockpitTrend() {
    return SHIPPER_COCKPIT_TREND;
  },

  async getDefaultCargoId() {
    return SHIPPER_DEFAULT_CARGO_ID;
  }
};
