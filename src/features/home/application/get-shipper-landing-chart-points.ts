import type { OperationalChartPoint } from '@/shared/design-system/patterns/operational-chart';

const SHIPPER_LANDING_CHART: OperationalChartPoint[] = [
  { label: 'T1', value: 42 },
  { label: 'T2', value: 48 },
  { label: 'T3', value: 45 },
  { label: 'T4', value: 52 },
  { label: 'T5', value: 58 }
];

export async function getShipperLandingChartPoints() {
  return SHIPPER_LANDING_CHART;
}
