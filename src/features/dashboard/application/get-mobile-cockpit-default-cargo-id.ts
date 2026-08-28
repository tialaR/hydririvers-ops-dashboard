import { mockOwnedCargoRepository } from '@/features/cargo/owned/repositories/mock-owned-cargo.repository';

export async function getMobileCockpitDefaultCargoId() {
  return mockOwnedCargoRepository.getDefaultCargoId();
}
