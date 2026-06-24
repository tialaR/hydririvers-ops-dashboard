import { getImpactSummary } from '@/features/shipper-mobile-flow/application/get-impact-summary';
import type { ShipperOperationalChartSlice } from '@/features/shipper-mobile-flow/types/shipper-chart-types';

export async function getImpactChartData(): Promise<ShipperOperationalChartSlice> {
  const summary = await getImpactSummary();

  return {
    points: summary.co2BarSeries,
    riskLevel: 'low',
    freshnessMinutes: 45,
    freshnessState: 'fresh'
  };
}
