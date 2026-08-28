import { createOwnedCargoRepository } from '@/features/cargo/owned/repositories/owned-cargo-repository-provider';

export async function listOwnedCargoes() {
  return createOwnedCargoRepository().listOwnedCargoes();
}
