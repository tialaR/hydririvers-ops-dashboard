import type { WaterwayCorridorId } from '@/features/waterway-tracking/domain/waterway-corridor.types';

/** Cargas demo com rotas mock versionadas (ADR 0031). */
export const HYDROWAY_DEMO_CARGO_IDS = [
  'CARGO-001',
  'CARGO-002',
  'CARGO-003',
  'CARGO-004',
  'CARGO-009',
  'HYD-2026-00020',
] as const;

export type HydrowayDemoCargoId = (typeof HYDROWAY_DEMO_CARGO_IDS)[number];

export function isHydrowayDemoCargoId(value: string): value is HydrowayDemoCargoId {
  return (HYDROWAY_DEMO_CARGO_IDS as readonly string[]).includes(value);
}

/** Rio principal ou afluente largo (camada waterway-main / waterway-tributary). */
export type HydrowayRiverDefinition = {
  id: string;
  name: string;
  kind: 'river' | 'tributary';
  corridorId?: WaterwayCorridorId;
};

/** Hidrovia classificada navegável (ex.: HN-100 fictício). */
export type HydrowayNavigableCorridorDefinition = {
  id: string;
  name: string;
  corridorId: WaterwayCorridorId;
  classification: string;
};

/** Porto interior na rede mock. */
export type HydrowayPortDefinition = {
  id: string;
  name: string;
  kind: 'port';
  corridorId?: WaterwayCorridorId;
};

/** Terminal de carga ou transbordo. */
export type HydrowayTerminalDefinition = {
  id: string;
  name: string;
  kind: 'terminal';
  corridorId: WaterwayCorridorId;
};

/** Rota de carga demo (LineString em cargo-routes.mock.geojson). */
export type HydrowayRouteDefinition = {
  id: string;
  cargoId: HydrowayDemoCargoId;
  name: string;
  corridorId: WaterwayCorridorId;
  originLabel: string;
  destinationLabel: string;
};

/** Extremidade de rota (origem ou destino). */
export type HydrowayRouteEndpointDefinition = {
  id: string;
  name: string;
  kind: 'origin' | 'destination';
  cargoId: HydrowayDemoCargoId;
  label: string;
};

/** Posição atual da embarcação (mock determinístico). */
export type HydrowayVesselLocationDefinition = {
  id: string;
  name: string;
  cargoId: HydrowayDemoCargoId;
  corridorId: WaterwayCorridorId;
  heading: number;
};
