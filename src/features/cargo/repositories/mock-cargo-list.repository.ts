import { buildVisualCargoPool } from '@/features/cargo/data/build-visual-cargo-pool';
import { getCargoById, getPublicCargos } from '@/features/cargo/services/cargo.service';
import type { CargoListRepository } from '@/features/cargo/repositories/cargo-list.repository';
import type { MobileCargoListFilters } from '@/features/cargo/domain/cargo-list.types';

const DEFAULT_FILTERS: MobileCargoListFilters = {
  chips: [
    { id: 'all', labelKey: 'filters.all' },
    { id: 'open', labelKey: 'filters.open' },
    { id: 'bidding', labelKey: 'filters.bidding' },
    { id: 'contracting', labelKey: 'filters.contracting' },
    { id: 'reserved', labelKey: 'filters.reserved' },
    { id: 'boarded', labelKey: 'filters.boarded' },
    { id: 'attention', labelKey: 'filters.attention' },
  ],
};

/** Implementação mock: reutiliza cargas públicas e pool visual sem alterar fixtures originais. */
export const mockCargoListRepository: CargoListRepository = {
  async listMobileCargoes() {
    const publicList = await getPublicCargos();
    return buildVisualCargoPool(publicList);
  },

  async getCargoListFilters() {
    return DEFAULT_FILTERS;
  },

  async getCargoById(id) {
    return getCargoById(id);
  },
};
