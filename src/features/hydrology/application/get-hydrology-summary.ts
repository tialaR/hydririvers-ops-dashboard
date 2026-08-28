import { mockHydrologyRepository } from '../repositories/mock-hydrology-repository';

export async function getHydrologySummary() {
  return mockHydrologyRepository.getSummary();
}
