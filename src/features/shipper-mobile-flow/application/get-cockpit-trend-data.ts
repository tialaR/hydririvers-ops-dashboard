import { createShipperMobileRepositories } from '@/features/shipper-mobile-flow/data/repositories/repository-provider';
import type { ShipperOperationalChartSlice } from '@/features/shipper-mobile-flow/types/shipper-chart-types';

export async function getCockpitTrendData(): Promise<ShipperOperationalChartSlice> {
  const { cargo } = createShipperMobileRepositories();
  const points = await cargo.getCockpitTrend();

  return {
    points,
    riskLevel: 'high',
    freshnessMinutes: 8,
    freshnessState: 'fresh'
  };
}
