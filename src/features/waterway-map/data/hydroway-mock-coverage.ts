import type { WaterwayCorridorId } from '@/features/waterway-tracking/domain/waterway-corridor.types';

/** Hidrovias prioritárias Arco Norte — cobertura mínima V2.6 (ids de feature mock). */
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

/** Nós logísticos mínimos V2.6 (ids de porto/terminal mock). */
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
  'terminal-vila-conde',
  'terminal-miritituba',
] as const;
