export type {
  CargoWaterwayTrackingScenario,
  CargoWaterwayMetrics,
  WaterwayCorridor,
  WaterwayCorridorId,
  WaterwayConstraint,
  WaterwayOperationalStatus,
  WaterwayRiskLevel,
} from './domain/waterway-tracking.types';

export {
  CARGO_WATERWAY_TRACKING_SCENARIOS,
  DEFAULT_CARGO_WATERWAY_TRACKING_SCENARIO,
  getCargoWaterwayTrackingScenario,
  getCargoWaterwayTrackingScenarioIds,
} from './data/cargo-waterway-tracking.mock';

export { WATERWAY_CORRIDORS } from './data/waterway-corridors.mock';

export {
  formatCurrencyBRL,
  getOperationalStatusLabel,
  getRemainingProgressLabel,
  getRiskLabel,
} from './utils/waterway-tracking.utils';

export { createCargoWaterwayTrackingScenario } from './utils/cargo-scenario-adapter';
