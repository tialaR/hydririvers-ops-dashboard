import type { HydrologyRepository } from '../domain/hydrology-repository';
import { HYDROLOGY_BASINS, RIVER_LEVEL_SERIES } from '../mocks/hydrology.mock';

export const mockHydrologyRepository: HydrologyRepository = {
  async getSummary() {
    return {
      basins: HYDROLOGY_BASINS,
      riverLevelSeries: RIVER_LEVEL_SERIES
    };
  }
};
