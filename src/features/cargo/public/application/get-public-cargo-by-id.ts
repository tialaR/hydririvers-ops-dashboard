import { createPublicCargoRepository } from '../repositories/public-cargo-repository-provider';

export async function getPublicCargoById(id: string) {
  return createPublicCargoRepository().getPublicCargoById(id);
}
