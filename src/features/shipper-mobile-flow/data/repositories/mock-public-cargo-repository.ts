import { SHIPPER_PUBLIC_CARGOES } from '@/features/shipper-mobile-flow/data/mock/shipper-public-cargo-mock';
import {
  filterPublicCargoList,
  toPublicCargoSafeView
} from '@/features/shipper-mobile-flow/domain/public-cargo-privacy-domain';
import type { PublicCargoRepository } from '@/features/shipper-mobile-flow/domain/repositories/public-cargo-repository';

export const mockPublicCargoRepository: PublicCargoRepository = {
  async listPublicCargoes() {
    return filterPublicCargoList(SHIPPER_PUBLIC_CARGOES);
  },

  async getPublicCargoById(id) {
    const cargo = SHIPPER_PUBLIC_CARGOES.find((item) => item.id === id);
    return cargo ? toPublicCargoSafeView(cargo) : undefined;
  }
};
