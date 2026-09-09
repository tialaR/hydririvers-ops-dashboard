import { mockOwnedCargoRepository } from '@/features/cargo/owned/repositories/mock-owned-cargo.repository';
import type { OperationalChartSlice } from '@/shared/design-system/patterns/operational-chart';

export async function getMobileCockpitTrendData(): Promise<OperationalChartSlice> {
  const points = await mockOwnedCargoRepository.getCockpitTrend();

  return {
    points,
    riskLevel: 'high',
    freshnessMinutes: 8,
    freshnessState: 'fresh'
  };
}
