import type { Cargo } from '@/features/marketplace/domain/marketplace.types';

import type { MobileCargoListFilters } from '../domain/cargo-list.types';

export type CargoListRepository = {
  listMobileCargoes(): Promise<Cargo[]>;
  getCargoListFilters(): Promise<MobileCargoListFilters>;
  getCargoById(id: string): Promise<Cargo | undefined>;
};
