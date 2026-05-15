import { createCargoWaterwayTrackingScenario } from './utils/cargo-scenario-adapter';

export * from './domain/waterway-corridor.types';
export * from './domain/waterway-tracking.types';

export * from './data/waterway-corridors.mock';
export * from './data/cargo-waterway-tracking.mock';

export * from './utils/cargo-scenario-adapter';
export * from './utils/waterway-tracking.utils';
export * from './utils/waterway-progress.utils';

export {
  cargoWaterwayTrackingByCargoId,
  cargoWaterwayTrackingMock,
  getPrimaryWaterwayConstraint,
  getWaterwayOperationalLabel,
  waterwayCorridorsMock,
} from './waterway-compat';

export type {
  CargoWaterwayTracking,
  CargoWaterwayTrackingCompat,
} from './waterway-compat';

export type CargoWaterwayTrackingScenario = ReturnType<
  typeof createCargoWaterwayTrackingScenario
>;
