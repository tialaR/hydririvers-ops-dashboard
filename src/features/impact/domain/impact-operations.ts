import type { OperationalChartPoint } from '@/shared/design-system/patterns/operational-chart';

export type ImpactMetric = {
  id: string;
  labelKey: string;
  valueLabel: string;
};

export type ImpactSummary = {
  metrics: ImpactMetric[];
  co2BarSeries: OperationalChartPoint[];
};

export type ImpactRepository = {
  getSummary(): Promise<ImpactSummary>;
};
