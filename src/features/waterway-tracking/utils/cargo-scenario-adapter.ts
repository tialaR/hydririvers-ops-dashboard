import {
  CARGO_WATERWAY_TRACKING_SCENARIOS,
  getCargoWaterwayTrackingScenario,
} from '../data/cargo-waterway-tracking.mock';
import type {
  CargoLifecycleStatus,
  CargoWaterwayTrackingScenario,
} from '../domain/waterway-tracking.types';
import {
  clampWaterwayPercent,
  getDefaultOperationalStatusForCargoStatus,
  getDefaultProgressForCargoStatus,
  getRemainingWaterwayPercent,
} from './waterway-progress.utils';

type CargoScenarioInput = {
  cargoId: string;
  title: string;
  origin: string;
  destination: string;
  cargoType?: string;
  co2Saving?: string;
  connectivity?: 'online' | 'delayedSync' | 'lowSignal';
  corridor?: string;
  documentReadiness?: number;
  etaConfidence?: string;
  mainRiver?: string;
  priority?: CargoWaterwayTrackingScenario['priority'];
  progressPercent?: number;
  status?: CargoLifecycleStatus;
  targetPrice?: string;
  window?: string;
};

const CONNECTIVITY_TO_SIGNAL_PERCENT: Record<NonNullable<CargoScenarioInput['connectivity']>, number> = {
  online: 96,
  delayedSync: 78,
  lowSignal: 61,
};

function clampPercent(value: number): number {
  return clampWaterwayPercent(value);
}

function getProgressPercent(input: CargoScenarioInput, fallback: number): number {
  if (typeof input.progressPercent === 'number') {
    return clampPercent(input.progressPercent);
  }

  if (input.status) {
    return getDefaultProgressForCargoStatus(input.status);
  }

  return fallback;
}

function getRemainingPercent(progressPercent: number): number {
  return getRemainingWaterwayPercent(progressPercent);
}

function getOperationalStatus(input: CargoScenarioInput, fallback: CargoWaterwayTrackingScenario['status']) {
  if (!input.status) {
    return fallback;
  }

  return getDefaultOperationalStatusForCargoStatus(input.status);
}

function parseEtaLabel(input: CargoScenarioInput, fallback: string): string {
  const etaFromConfidence = input.etaConfidence?.split('•')[0]?.trim();

  if (etaFromConfidence) {
    return etaFromConfidence.replace(/^ETA\s*/i, '').trim() || fallback;
  }

  if (input.window?.trim()) {
    return input.window.trim();
  }

  return fallback;
}

function parseCurrencyValue(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const numeric = Number(value.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(numeric) ? numeric : fallback;
}

function parsePercentValue(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const match = value.match(/-?\d+(?:[.,]\d+)?/);

  if (!match) {
    return fallback;
  }

  const numeric = Number(match[0].replace(',', '.'));
  return Number.isFinite(numeric) ? Math.abs(Math.round(numeric)) : fallback;
}

function getSignalPercent(input: CargoScenarioInput, fallback: number): number {
  if (!input.connectivity) {
    return fallback;
  }

  return CONNECTIVITY_TO_SIGNAL_PERCENT[input.connectivity];
}

function splitCityState(value: string) {
  const [city, state] = value.split(',').map((item) => item.trim());

  return {
    city: city ?? value,
    state: state ?? '',
  };
}

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
  const progressPercent = getProgressPercent(input, baseScenario.metrics.progressPercent);
  const operationalStatus = getOperationalStatus(input, baseScenario.status);
  const etaLabel = parseEtaLabel(input, baseScenario.metrics.etaLabel);
  const signalPercent = getSignalPercent(input, baseScenario.metrics.signalPercent);
  const documentsReadyPercent = input.documentReadiness ?? baseScenario.metrics.documentsReadyPercent;
  const estimatedCostBRL = parseCurrencyValue(input.targetPrice, baseScenario.metrics.estimatedCostBRL);
  const co2SavingsPercent = parsePercentValue(input.co2Saving, baseScenario.metrics.co2SavingsPercent);
  const remainingPercent = getRemainingPercent(progressPercent);
  const priority = input.priority ?? baseScenario.priority;
  const originTerminal = `Terminal ${input.origin}`;
  const destinationTerminal = `Terminal ${input.destination}`;
  const originPoint = splitCityState(input.origin);
  const destinationPoint = splitCityState(input.destination);

  return {
    ...baseScenario,
    id: input.cargoId,
    cargoId: input.cargoId,
    cargoStatus: input.status ?? baseScenario.cargoStatus,
    title: input.title,
    cargoType: input.cargoType ?? baseScenario.cargoType,
    priorityLevel: priority,
    priority,
    operationalStatus,
    status: operationalStatus,
    originTerminal,
    destinationTerminal,
    vesselName: baseScenario.vessel.name,
    route: {
      ...baseScenario.route,
      origin: {
        ...baseScenario.route.origin,
        city: originPoint.city,
        state: originPoint.state || baseScenario.route.origin.state,
        terminal: originTerminal,
        description: `Coleta confirmada em ${input.origin}.`,
      },
      destination: {
        ...baseScenario.route.destination,
        city: destinationPoint.city,
        state: destinationPoint.state || baseScenario.route.destination.state,
        terminal: destinationTerminal,
        description: `Atracacao prevista em ${input.destination}.`,
      },
      currentDescription:
        baseScenario.route.currentDescription ||
        `Carga ${input.cargoId} em navegacao hidroviaria monitorada.`,
    },
    metrics: {
      ...baseScenario.metrics,
      progressPercent,
      remainingPercent,
      etaLabel,
      signalPercent,
      documentsReadyPercent,
      estimatedCostBRL,
      co2SavingsPercent,
    },
    progressPercent,
    remainingPercent,
    eta: etaLabel,
    signalPercent,
    documentsReadyPercent,
    estimatedCost: estimatedCostBRL,
    co2SavingsPercent,
    map: {
      ...baseScenario.map,
      primaryRiverLabel: input.mainRiver ?? baseScenario.map.primaryRiverLabel,
      secondaryRiverLabel: input.corridor ?? input.mainRiver ?? baseScenario.map.secondaryRiverLabel,
    },
  };
}
