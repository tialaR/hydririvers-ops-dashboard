import { createPublicCargoRepository } from '../repositories/public-cargo-repository-provider';

export async function listPublicCargoes() {
  return createPublicCargoRepository().listPublicCargoes();
}
