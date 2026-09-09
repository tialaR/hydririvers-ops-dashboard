import type { OperationalChartSlice } from '@/shared/design-system/patterns/operational-chart';
import { getImpactSummary } from './get-impact-summary';

export async function getImpactChartData(): Promise<OperationalChartSlice> {
  const summary = await getImpactSummary();

  return {
    points: summary.co2BarSeries,
    riskLevel: 'low',
    freshnessMinutes: 45,
    freshnessState: 'fresh'
  };
}
