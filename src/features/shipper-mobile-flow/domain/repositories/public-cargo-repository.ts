import type { PublicCargoSafeView } from '@/features/shipper-mobile-flow/domain/public-cargo-privacy-domain';

export type PublicCargoRepository = {
  listPublicCargoes(): Promise<PublicCargoSafeView[]>;
  getPublicCargoById(id: string): Promise<PublicCargoSafeView | undefined>;
};
