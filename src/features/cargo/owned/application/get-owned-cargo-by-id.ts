import { createOwnedCargoRepository } from '@/features/cargo/owned/repositories/owned-cargo-repository-provider';

export async function getOwnedCargoById(id: string) {
  return createOwnedCargoRepository().getOwnedCargoById(id);
}
