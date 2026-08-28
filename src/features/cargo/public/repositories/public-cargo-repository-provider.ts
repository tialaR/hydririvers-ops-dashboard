import { mockPublicCargoRepository } from './mock-public-cargo.repository';
import type { PublicCargoRepository } from '../domain/public-cargo-repository';

export function createPublicCargoRepository(): PublicCargoRepository {
  return mockPublicCargoRepository;
}
