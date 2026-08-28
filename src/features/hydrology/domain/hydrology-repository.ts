import type { HydrologySummary } from './hydrology-types';

export type HydrologyRepository = {
  getSummary(): Promise<HydrologySummary>;
};
