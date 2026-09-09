import type { OperationalChartPoint } from '@/shared/design-system/patterns/operational-chart';
import type { ImpactMetric } from '../domain/impact-operations';

export const IMPACT_CO2_BAR_SERIES: OperationalChartPoint[] = [
  { label: 'Rodoviário', value: 100 },
  { label: 'Hidrovia', value: 62 },
  { label: 'Meta', value: 55 }
];

export const IMPACT_METRICS: ImpactMetric[] = [
  { id: 'co2', labelKey: 'co2Avoided', valueLabel: '-38%' },
  { id: 'licensing', labelKey: 'licensing', valueLabel: '3/4' },
  { id: 'community', labelKey: 'community', valueLabel: '2 alertas' },
  { id: 'esg', labelKey: 'esgResidue', valueLabel: 'OK' }
];
