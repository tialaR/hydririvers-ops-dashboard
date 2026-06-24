import {
  SHIPPER_CO2_BAR_SERIES,
  SHIPPER_HYDROLOGY_BASINS,
  SHIPPER_IMPACT_METRICS,
  SHIPPER_LANDING_CHART,
  SHIPPER_RIVER_LEVEL_SERIES
} from '@/features/shipper-mobile-flow/data/mock/shipper-hydro-mock';
import type { HydroRepository } from '@/features/shipper-mobile-flow/domain/repositories/hydro-repository';

export const mockHydroRepository: HydroRepository = {
  async getHydrologySummary() {
    return {
      basins: SHIPPER_HYDROLOGY_BASINS,
      riverLevelSeries: SHIPPER_RIVER_LEVEL_SERIES
    };
  },

  async getImpactSummary() {
    return {
      metrics: SHIPPER_IMPACT_METRICS,
      co2BarSeries: SHIPPER_CO2_BAR_SERIES
    };
  },

  async getLandingChartPoints() {
    return SHIPPER_LANDING_CHART;
  }
};
