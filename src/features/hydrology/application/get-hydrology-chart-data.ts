import type { OperationalChartSlice } from '@/shared/design-system/patterns/operational-chart';
import { getHydrologySummary } from './get-hydrology-summary';

export async function getHydrologyChartData(): Promise<OperationalChartSlice> {
  const summary = await getHydrologySummary();
  const primaryBasin = summary.basins.find((basin) => basin.id === 'madeira') ?? summary.basins[0];

  return {
    points: summary.riverLevelSeries,
    riskLevel: primaryBasin?.status ?? 'medium',
    freshnessMinutes: 18,
    freshnessState: 'fresh'
  };
}
