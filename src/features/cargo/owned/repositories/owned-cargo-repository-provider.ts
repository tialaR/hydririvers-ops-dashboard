import { persistedOwnedCargoRepository } from './persisted-owned-cargo.repository';
import type { OwnedCargoRepository } from '@/features/cargo/owned/domain/owned-cargo-repository';

export function createOwnedCargoRepository(): OwnedCargoRepository {
  return persistedOwnedCargoRepository;
}
