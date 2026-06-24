import { getHydrologySummary } from '@/features/shipper-mobile-flow/application/get-hydrology-summary';
import type { ShipperOperationalChartSlice } from '@/features/shipper-mobile-flow/types/shipper-chart-types';

export async function getHydrologyChartData(): Promise<ShipperOperationalChartSlice> {
  const summary = await getHydrologySummary();
  const primaryBasin = summary.basins.find((basin) => basin.id === 'madeira') ?? summary.basins[0];

  return {
    points: summary.riverLevelSeries,
    riskLevel: primaryBasin?.status ?? 'medium',
    freshnessMinutes: 18,
    freshnessState: 'fresh'
  };
}
