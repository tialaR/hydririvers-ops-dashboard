import { createOwnedCargoRepository } from '@/features/cargo/owned/repositories/owned-cargo-repository-provider';

export async function getOwnedCargoDocuments(cargoId: string) {
  return createOwnedCargoRepository().getDocumentsForCargo(cargoId);
}
