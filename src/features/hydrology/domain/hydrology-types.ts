import type { OperationalChartPoint, OperationalRiskLevel } from '@/shared/design-system/patterns/operational-chart';

export type HydrologyBasin = {
  id: string;
  nameKey: string;
  draftMeters: number;
  trendKey: string;
  status: OperationalRiskLevel;
};

export type HydrologySummary = {
  basins: HydrologyBasin[];
  riverLevelSeries: OperationalChartPoint[];
};
