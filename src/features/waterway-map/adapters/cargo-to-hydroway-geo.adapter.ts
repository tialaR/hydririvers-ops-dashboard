import type { Cargo, CargoStatus } from '@/features/marketplace/domain/marketplace.types';
import type { CargoWaterwayTrackingCompat } from '@/features/waterway-tracking/waterway-compat';
import type { WaterwayCorridorId } from '@/features/waterway-tracking/domain/waterway-corridor.types';
import { normalizeCargoId } from '@/shared/routing/normalize-cargo-id';

import {
  isHydrowayDemoCargoId,
  type HydrowayDemoCargoId,
} from '../domain/hydroway-entities.types';
import type { HydrowayMapMetadata, HydrowayMapModel } from '../domain/hydroway-map-model.types';
import { findHydrowayCargoRouteFeature } from '../data/load-mock-geojson';
import {
  assembleHydrowayGeoJsonSources,
  buildHydrowayDynamicGeoSources,
} from './geojson-sources';
import {
  formatHydrowayShortLocation,
  mapTrackingCorridorToGeoCorridor,
  resolveHydrowayLocation,
} from './location-resolver';
import {
  buildFallbackRouteCoordinates,
  buildHydrowayRouteGeometry,
} from './route-geometry';

/** Progresso visual demo alinhado ao desktop expanded (determinístico). */
const DEMO_CARGO_PROGRESS_OVERRIDES: Record<HydrowayDemoCargoId, number> = {
  'CARGO-001': 0.15,
  'CARGO-002': 0.25,
  'CARGO-004': 0.4,
};

function progress01FromCargoStatus(status: CargoStatus): number {
  switch (status) {
    case 'open':
      return 0.15;
    case 'bidding':
      return 0.25;
    case 'contracting':
      return 0.35;
    case 'reserved':
      return 0.5;
    case 'boarded':
      return 0.65;
    case 'delivered':
      return 1;
    default:
      return 0.25;
  }
}

export type CargoHydrowayAdapterInput = {
  cargo: Cargo;
  tracking?: CargoWaterwayTrackingCompat;
};

function resolveProgress01(cargoId: string, cargo: Cargo, tracking?: CargoWaterwayTrackingCompat): number {
  if (isHydrowayDemoCargoId(cargoId)) {
    return DEMO_CARGO_PROGRESS_OVERRIDES[cargoId];
  }
  if (tracking?.progressPercent !== undefined) {
    return Math.max(0, Math.min(1, tracking.progressPercent / 100));
  }
  return progress01FromCargoStatus(cargo.status);
}

function resolveCorridorId(
  cargoId: string,
  routeCorridorId: WaterwayCorridorId | undefined,
  tracking?: CargoWaterwayTrackingCompat,
): WaterwayCorridorId {
  if (routeCorridorId) {
    return routeCorridorId;
  }
  if (tracking?.corridorId) {
    return mapTrackingCorridorToGeoCorridor(tracking.corridorId);
  }
  if (cargoId.startsWith('CARGO-')) {
    return 'amazonas';
  }
  return 'amazonas';
}

function buildRouteName(originLabel: string, destinationLabel: string): string {
  return `${originLabel} → ${destinationLabel}`;
}

/**
 * Adapter puro Cargo + tracking → HydrowayMapModel (V2.2b).
 * Usa mocks GeoJSON V2.2a para cargas demo; fallback determinístico para demais casos.
 */
export function adaptCargoToHydrowayMapModel(input: CargoHydrowayAdapterInput): HydrowayMapModel {
  const cargoId = normalizeCargoId(input.cargo.id);
  const originLabel = formatHydrowayShortLocation(input.cargo.origin);
  const destinationLabel = formatHydrowayShortLocation(input.cargo.destination);
  const progress01 = resolveProgress01(cargoId, input.cargo, input.tracking);

  const resolvedOrigin = resolveHydrowayLocation(input.cargo.origin);
  const resolvedDestination = resolveHydrowayLocation(input.cargo.destination);

  const demoRoute = isHydrowayDemoCargoId(cargoId)
    ? findHydrowayCargoRouteFeature(cargoId)
    : undefined;

  const routeSource: HydrowayMapMetadata['routeSource'] = demoRoute ? 'demo-geojson' : 'fallback-line';

  const routeCoordinates = demoRoute
    ? demoRoute.geometry.coordinates
    : buildFallbackRouteCoordinates(
        resolvedOrigin.coordinates,
        resolvedDestination.coordinates,
        cargoId,
      );

  const corridorId = resolveCorridorId(
    cargoId,
    demoRoute?.properties?.corridorId as WaterwayCorridorId | undefined,
    input.tracking,
  );

  const routeName =
    demoRoute?.properties?.name ?? buildRouteName(originLabel, destinationLabel);

  const geometry = buildHydrowayRouteGeometry(routeCoordinates, progress01);

  const dynamic = buildHydrowayDynamicGeoSources({
    cargoId,
    corridorId,
    routeName,
    originLabel,
    destinationLabel,
    progress01,
    geometry,
    routeSource,
    originUsedFallback: resolvedOrigin.usedFallback,
    destinationUsedFallback: resolvedDestination.usedFallback,
    vesselName: input.tracking?.vesselName,
  });

  const metadata: HydrowayMapMetadata = {
    originLabel,
    destinationLabel,
    progress01,
    routeName,
    routeSource,
    vesselName: input.tracking?.vesselName,
    segmentId: input.tracking?.segmentId,
    eta: input.tracking?.eta,
    operationalStatus: input.tracking?.operationalStatus,
    locationFallbacks: {
      origin: resolvedOrigin.usedFallback,
      destination: resolvedDestination.usedFallback,
    },
  };

  return {
    cargoId,
    corridorId,
    progress01,
    metadata,
    geo: assembleHydrowayGeoJsonSources(dynamic),
    bbox: geometry.bbox,
  };
}
