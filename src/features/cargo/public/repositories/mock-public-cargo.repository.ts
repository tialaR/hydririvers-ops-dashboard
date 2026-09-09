import { PUBLIC_CARGOES } from '../mocks/public-cargo.mock';
import { filterPublicCargoList, toPublicCargoSafeView } from '../domain/public-cargo-privacy';
import type { PublicCargoRepository } from '../domain/public-cargo-repository';

export const mockPublicCargoRepository: PublicCargoRepository = {
  async listPublicCargoes() {
    return filterPublicCargoList(PUBLIC_CARGOES);
  },

  async getPublicCargoById(id) {
    const cargo = PUBLIC_CARGOES.find((item) => item.id === id);
    return cargo ? toPublicCargoSafeView(cargo) : undefined;
  }
};
