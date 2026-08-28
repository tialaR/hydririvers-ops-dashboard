import { createOwnedCargoRepository } from '@/features/cargo/owned/repositories/owned-cargo-repository-provider';

export async function getOwnedCargoOffers(cargoId: string) {
  return createOwnedCargoRepository().getOffersForCargo(cargoId);
}
