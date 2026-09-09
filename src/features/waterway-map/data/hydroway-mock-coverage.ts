import type { WaterwayCorridorId } from '@/features/waterway-tracking/domain/waterway-corridor.types';

import type { HydrowayDemoCargoId } from '../domain/hydroway-entities.types';

/** Hidrovias prioritárias Arco Norte — cobertura mínima V2.6 GOV-enriched. */
export const HYDROWAY_V26_REQUIRED_RIVER_IDS = [
  'amazonas-solimoes',
  'madeira',
  'tapajos',
  'tocantins',
  'para-estuario',
] as const;

/** Corredores navegáveis classificados — cobertura mínima V2.6. */
export const HYDROWAY_V26_REQUIRED_CORRIDOR_IDS = [
  'corridor-amazonas-hn100',
  'corridor-madeira',
  'corridor-tapajos-teles-pires',
  'corridor-tocantins-araguaia',
  'corridor-barra-norte',
] as const;

export const HYDROWAY_V26_REQUIRED_CORRIDOR_KINDS: readonly WaterwayCorridorId[] = [
  'amazonas',
  'madeira',
  'tapajos-teles-pires',
  'tocantins-araguaia',
  'barra-norte',
];

/** Nós logísticos mínimos V2.6 GOV-enriched (ids de porto/terminal/transbordo mock). */
export const HYDROWAY_V26_REQUIRED_NODE_IDS = [
  'port-belem',
  'port-barcarena',
  'port-santarem',
  'port-itaituba',
  'port-manaus',
  'port-itacoatiara',
  'port-porto-velho',
  'port-macapa',
  'port-abaetetuba',
  'port-obidos',
  'port-parintins',
  'port-tefe',
  'port-maraba',
  'port-breves',
  'port-alenquer',
  'port-juruti',
  'port-altamira',
  'port-prainha',
  'terminal-vila-conde',
  'terminal-miritituba',
] as const;

export const HYDROWAY_V26_DEMO_CARGO_IDS: readonly HydrowayDemoCargoId[] = [
  'CARGO-001',
  'CARGO-002',
  'CARGO-003',
  'CARGO-004',
  'CARGO-009',
  'HYD-2026-00020',
];

/** Mínimo de vértices por rota demo (geometria curvilínea). */
export const HYDROWAY_V26_MIN_ROUTE_COORDINATES = 24;

/** Metadados GOV obrigatórios em features estáticas enriquecidas. */
export const HYDROWAY_V26_REQUIRED_GOV_FIELDS = [
  'sourceInspiration',
  'sourceType',
  'confidence',
  'mockLevel',
  'lastReviewed',
  'visualPurpose',
] as const;

export const HYDROWAY_V26_MOCK_GEO_FILES = [
  'amazon-main-rivers.mock.geojson',
  'amazon-secondary-rivers.mock.geojson',
  'amazon-operational-channels.mock.geojson',
  'amazon-navigable-corridors.mock.geojson',
  'amazon-logistics-nodes.mock.geojson',
  'amazon-risk-zones.mock.geojson',
  'cargo-routes.mock.geojson',
] as const;
