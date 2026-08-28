import { mockOwnedCargoRepository } from './mock-owned-cargo.repository';
import type { OwnedCargoRepository } from '@/features/cargo/owned/domain/owned-cargo-repository';

export function createOwnedCargoRepository(): OwnedCargoRepository {
  return mockOwnedCargoRepository;
}
