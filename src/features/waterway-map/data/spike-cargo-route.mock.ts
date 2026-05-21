import type { HydrowayCargoRouteScene, HydrowayMapScene } from '../providers/map-provider.types';
import { SPIKE_CONTEXT_CITIES, SPIKE_RIVER_CORRIDORS } from './spike-amazon-river.mock';

const CARGO_001_ORIGIN = { x: 1420, y: 430 };
const CARGO_001_DESTINATION = { x: 980, y: 468 };
const CARGO_001_VESSEL = { x: 1280, y: 440 };

/** Rota fictícia Belém → Santarém (CARGO-001), progresso 15%. */
export const SPIKE_CARGO_001_ROUTE: HydrowayCargoRouteScene = {
  cargoId: 'CARGO-001',
  corridorId: 'amazonas',
  originLabel: 'Belém, PA',
  destinationLabel: 'Santarém, PA',
  origin: CARGO_001_ORIGIN,
  destination: CARGO_001_DESTINATION,
  routePathD:
    'M 1420 430 C 1340 438, 1260 448, 1180 456 C 1100 462, 1040 466, 980 468',
  traveledPathD:
    'M 1420 430 C 1368 434, 1320 438, 1280 440',
  vessel: CARGO_001_VESSEL,
  progress01: 0.15,
};

export const SPIKE_DEFAULT_MAP_SCENE: HydrowayMapScene = {
  corridors: SPIKE_RIVER_CORRIDORS,
  cities: SPIKE_CONTEXT_CITIES,
  route: SPIKE_CARGO_001_ROUTE,
};
