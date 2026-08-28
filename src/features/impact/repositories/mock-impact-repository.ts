import type { ImpactRepository } from '../domain/impact-operations';
import { IMPACT_CO2_BAR_SERIES, IMPACT_METRICS } from '../mocks/impact-operations.mock';

export const mockImpactRepository: ImpactRepository = {
  async getSummary() {
    return {
      metrics: IMPACT_METRICS,
      co2BarSeries: IMPACT_CO2_BAR_SERIES
    };
  }
};
