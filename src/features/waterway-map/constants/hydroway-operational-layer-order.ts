import type { HydrowayOperationalLayerMode } from '../domain/hydroway-operational-domain.types';

/** Ordem de exibição no painel Camadas (produto mobile/desktop). */
export const HYDROWAY_OPERATIONAL_LAYER_MODE_ORDER: readonly HydrowayOperationalLayerMode[] = [
  'operation',
  'navigation',
  'logistics',
  'risk',
  'government',
] as const;

export function isHydrowayOperationalLayerMode(
  value: string,
): value is HydrowayOperationalLayerMode {
  return (HYDROWAY_OPERATIONAL_LAYER_MODE_ORDER as readonly string[]).includes(value);
}
