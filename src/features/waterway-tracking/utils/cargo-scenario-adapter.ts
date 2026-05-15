import {
  CARGO_WATERWAY_TRACKING_SCENARIOS,
  getCargoWaterwayTrackingScenario,
} from '../data/cargo-waterway-tracking.mock';
import type { CargoWaterwayTrackingScenario } from '../domain/waterway-tracking.types';

type CargoScenarioInput = {
  cargoId: string;
  title: string;
  origin: string;
  destination: string;
};

function getStableScenarioIndex(cargoId: string): number {
  const hash = Array.from(cargoId).reduce((total, char) => {
    return total + char.charCodeAt(0);
  }, 0);

  return hash % CARGO_WATERWAY_TRACKING_SCENARIOS.length;
}

function getBaseScenarioForCargo(cargoId: string): CargoWaterwayTrackingScenario {
  const exactScenario = getCargoWaterwayTrackingScenario(cargoId);

  if (exactScenario.cargoId === cargoId) {
    return exactScenario;
  }

  return CARGO_WATERWAY_TRACKING_SCENARIOS[getStableScenarioIndex(cargoId)];
}

export function createCargoWaterwayTrackingScenario(
  input: CargoScenarioInput,
): CargoWaterwayTrackingScenario {
  const baseScenario = getBaseScenarioForCargo(input.cargoId);

  return {
    ...baseScenario,
    id: input.cargoId,
    cargoId: input.cargoId,
    title: input.title,
    route: {
      ...baseScenario.route,
      origin: {
        ...baseScenario.route.origin,
        city: input.origin,
        terminal: `Terminal ${input.origin}`,
        description: `Coleta confirmada em ${input.origin}.`,
      },
      destination: {
        ...baseScenario.route.destination,
        city: input.destination,
        terminal: `Terminal ${input.destination}`,
        description: `Atracacao prevista em ${input.destination}.`,
      },
      currentDescription:
        baseScenario.route.currentDescription ||
        `Carga ${input.cargoId} em navegacao hidroviaria monitorada.`,
    },
  };
}
