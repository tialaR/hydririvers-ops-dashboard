import type {
  ShipperChartPoint,
  ShipperFreshnessState,
  ShipperRiskLevel
} from '@/features/shipper-mobile-flow/types/shipper-flow-types';

export type ShipperOperationalChartSlice = {
  points: ShipperChartPoint[];
  riskLevel: ShipperRiskLevel;
  freshnessMinutes: number;
  freshnessState: ShipperFreshnessState;
};
