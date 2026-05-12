import type { Cargo } from '@/features/marketplace/domain/marketplace.types';
import { getVesselVisual, stableHash } from './cargo-vessel-visual';

/**
 * Metadados só para apresentação na Visão geral do detalhe (mock).
 * Determinísticos por `cargo` — mesmo valor em SSR e cliente.
 */
export function getCargoDetailOverviewVisuals(cargo: Cargo) {
  const h = stableHash(cargo.id);
  const vesselVisual = getVesselVisual(cargo);
  const routeProgressPercent = 14 + (h % 72);
  const estimatedDistanceKm = 380 + (h % 920);
  return {
    vesselVisual,
    vesselImageUrl: vesselVisual.src,
    vesselName: vesselVisual.vesselName,
    routeProgressPercent,
    estimatedDistanceKm
  };
}
