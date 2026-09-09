import { createOwnedCargoRepository } from '@/features/cargo/owned/repositories/owned-cargo-repository-provider';

export async function getOwnedCargoById(id: string, ownerId: string) {
  return createOwnedCargoRepository().getOwnedCargoById(id, ownerId);
}
