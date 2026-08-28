import { createOwnedCargoRepository } from '@/features/cargo/owned/repositories/owned-cargo-repository-provider';

export async function getOwnedCargoMapData(id: string) {
  return createOwnedCargoRepository().getOwnedCargoMapData(id);
}
