import { createOwnedCargoRepository } from '@/features/cargo/owned/repositories/owned-cargo-repository-provider';

export async function listOwnedCargoes(ownerId: string) {
  return createOwnedCargoRepository().listOwnedCargoes(ownerId);
}
