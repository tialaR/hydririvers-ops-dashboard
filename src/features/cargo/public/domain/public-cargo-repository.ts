import type { PublicCargoSafeView } from './public-cargo-types';

export type PublicCargoRepository = {
  listPublicCargoes(): Promise<PublicCargoSafeView[]>;
  getPublicCargoById(id: string): Promise<PublicCargoSafeView | undefined>;
};
