import { createOwnedCargoRepository } from '@/features/cargo/owned/repositories/owned-cargo-repository-provider';

export async function getOwnedCargoOffers(cargoId: string, ownerId: string) {
  return createOwnedCargoRepository().getOffersForCargo(cargoId, ownerId);
}
