import { mockImpactRepository } from '../repositories/mock-impact-repository';

export async function getImpactSummary() {
  return mockImpactRepository.getSummary();
}
