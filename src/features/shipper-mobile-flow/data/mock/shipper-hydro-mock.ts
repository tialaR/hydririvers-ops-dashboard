import type {
  ShipperChartPoint,
  ShipperHydrologyBasin,
  ShipperImpactMetric
} from '@/features/shipper-mobile-flow/types/shipper-flow-types';

export const SHIPPER_HYDROLOGY_BASINS: ShipperHydrologyBasin[] = [
  { id: 'madeira', nameKey: 'madeira', draftMeters: 2.1, trendKey: 'ebbTrend', status: 'medium' },
  { id: 'tapajos', nameKey: 'tapajos', draftMeters: 2.8, trendKey: 'stableTrend', status: 'low' },
  { id: 'amazonas', nameKey: 'amazonas', draftMeters: 3.4, trendKey: 'floodTrend', status: 'low' },
  { id: 'tocantins', nameKey: 'tocantins', draftMeters: 1.9, trendKey: 'restrictedTrend', status: 'high' }
];

export const SHIPPER_RIVER_LEVEL_SERIES: ShipperChartPoint[] = [
  { label: 'D-6', value: 2.4 },
  { label: 'D-5', value: 2.3 },
  { label: 'D-4', value: 2.2 },
  { label: 'D-3', value: 2.15 },
  { label: 'D-2', value: 2.12 },
  { label: 'D-1', value: 2.1 },
  { label: 'Hoje', value: 2.08 }
];

export const SHIPPER_CO2_BAR_SERIES: ShipperChartPoint[] = [
  { label: 'Rodoviário', value: 100 },
  { label: 'Hidrovia', value: 62 },
  { label: 'Meta', value: 55 }
];

export const SHIPPER_IMPACT_METRICS: ShipperImpactMetric[] = [
  { id: 'co2', labelKey: 'co2Avoided', valueLabel: '-38%' },
  { id: 'licensing', labelKey: 'licensing', valueLabel: '3/4' },
  { id: 'community', labelKey: 'community', valueLabel: '2 alertas' },
  { id: 'esg', labelKey: 'esgResidue', valueLabel: 'OK' }
];

export const SHIPPER_LANDING_CHART: ShipperChartPoint[] = [
  { label: 'T1', value: 42 },
  { label: 'T2', value: 48 },
  { label: 'T3', value: 45 },
  { label: 'T4', value: 52 },
  { label: 'T5', value: 58 }
];
