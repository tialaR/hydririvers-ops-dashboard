import type {
  ShipperChartPoint,
  ShipperHydrologyBasin,
  ShipperImpactMetric
} from '@/features/shipper-mobile-flow/types/shipper-flow-types';

export type HydrologySummary = {
  basins: ShipperHydrologyBasin[];
  riverLevelSeries: ShipperChartPoint[];
};

export type ImpactSummary = {
  metrics: ShipperImpactMetric[];
  co2BarSeries: ShipperChartPoint[];
};

export type HydroRepository = {
  getHydrologySummary(): Promise<HydrologySummary>;
  getImpactSummary(): Promise<ImpactSummary>;
  getLandingChartPoints(): Promise<ShipperChartPoint[]>;
};
