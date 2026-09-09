import type { HydrologyBasin } from '../domain/hydrology-types';
import type { OperationalChartPoint } from '@/shared/design-system/patterns/operational-chart';

export const HYDROLOGY_BASINS: HydrologyBasin[] = [
  { id: 'madeira', nameKey: 'madeira', draftMeters: 2.1, trendKey: 'ebbTrend', status: 'medium' },
  { id: 'tapajos', nameKey: 'tapajos', draftMeters: 2.8, trendKey: 'stableTrend', status: 'low' },
  { id: 'amazonas', nameKey: 'amazonas', draftMeters: 3.4, trendKey: 'floodTrend', status: 'low' },
  { id: 'tocantins', nameKey: 'tocantins', draftMeters: 1.9, trendKey: 'restrictedTrend', status: 'high' }
];

export const RIVER_LEVEL_SERIES: OperationalChartPoint[] = [
  { label: 'D-6', value: 2.4 },
  { label: 'D-5', value: 2.3 },
  { label: 'D-4', value: 2.2 },
  { label: 'D-3', value: 2.15 },
  { label: 'D-2', value: 2.12 },
  { label: 'D-1', value: 2.1 },
  { label: 'Hoje', value: 2.08 }
];
