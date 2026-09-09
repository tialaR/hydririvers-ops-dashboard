import type { Cargo } from '@/features/marketplace/domain/marketplace.types';
import { getCargoWaterwayTracking } from '@/features/waterway-tracking/waterway-compat';
import { normalizeCargoId } from '@/shared/routing/normalize-cargo-id';

import { adaptCargoToHydrowayMapModel } from '../adapters/cargo-to-hydroway-geo.adapter';
import type { HydrowayMapModel } from '../domain/hydroway-map-model.types';
import { sanitizeRouteLineStringCoordinates } from '../utils/route-marker-geometry';

/** Valida par [lng, lat] finito para MapLibre. */
export function isValidLngLat(value: unknown): value is GeoJSON.Position {
  return (
    Array.isArray(value) &&
    value.length >= 2 &&
    typeof value[0] === 'number' &&
    Number.isFinite(value[0]) &&
    typeof value[1] === 'number' &&
    Number.isFinite(value[1])
  );
}

function isValidProgress01(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1;
}

function extractRouteCoordinates(model: HydrowayMapModel): GeoJSON.Position[] {
  const feature = model.geo.routeTrack.features[0];
  if (!feature || feature.geometry.type !== 'LineString') {
    return [];
  }
  return sanitizeRouteLineStringCoordinates(feature.geometry.coordinates);
}

function hasValidPointCollection(
  collection: GeoJSON.FeatureCollection,
  kind: 'origin' | 'destination' | 'vessel',
): boolean {
  const feature = collection.features.find((entry) => entry.properties?.kind === kind);
  if (!feature || feature.geometry.type !== 'Point') {
    return false;
  }
  return isValidLngLat(feature.geometry.coordinates);
}

/** Valida modelo completo antes de montar MapLibre. */
export function validateHydrowayMapModel(model: HydrowayMapModel): boolean {
  if (!model.cargoId || typeof model.cargoId !== 'string') {
    return false;
  }

  if (!isValidProgress01(model.progress01)) {
    return false;
  }

  const routeCoordinates = extractRouteCoordinates(model);
  if (routeCoordinates.length < 2) {
    return false;
  }

  if (!hasValidPointCollection(model.geo.origin, 'origin')) {
    return false;
  }

  if (!hasValidPointCollection(model.geo.destination, 'destination')) {
    return false;
  }

  if (!hasValidPointCollection(model.geo.vessel, 'vessel')) {
    return false;
  }

  if (!Array.isArray(model.bbox) || model.bbox.length !== 4) {
    return false;
  }

  return model.bbox.every((value) => typeof value === 'number' && Number.isFinite(value));
}

/** Normaliza progress01 e descarta modelos inválidos (nunca passar null ao provider). */
export function sanitizeHydrowayMapModel(model: HydrowayMapModel): HydrowayMapModel | null {
  const routeCoordinates = extractRouteCoordinates(model);
  const safeProgress = isValidProgress01(model.progress01)
    ? model.progress01
    : typeof model.metadata.progress01 === 'number' && Number.isFinite(model.metadata.progress01)
      ? Math.max(0, Math.min(1, model.metadata.progress01))
      : null;

  if (safeProgress === null || routeCoordinates.length < 2) {
    return null;
  }

  const candidate: HydrowayMapModel = {
    ...model,
    progress01: safeProgress,
    metadata: {
      ...model.metadata,
      progress01: safeProgress,
    },
  };

  return validateHydrowayMapModel(candidate) ? candidate : null;
}

function logProductModelResolved(model: HydrowayMapModel | null, cargoId: string): void {
  if (process.env.NODE_ENV !== 'development') return;

  const routeCoordinates = model ? extractRouteCoordinates(model) : [];
  console.info('[hydroway-map] product model resolved', {
    cargoId,
    hasModel: Boolean(model),
    routeCoordinatesLength: routeCoordinates.length,
    hasOrigin: model ? hasValidPointCollection(model.geo.origin, 'origin') : false,
    hasDestination: model ? hasValidPointCollection(model.geo.destination, 'destination') : false,
    hasCurrentCargoLocation: model ? hasValidPointCollection(model.geo.vessel, 'vessel') : false,
    progress01: model?.progress01 ?? null,
    providerMode: 'maplibre',
    isMobileViewport: null,
  });
}

/** Resolve HydrowayMapModel para rotas de produto (`/cargas/[id]/mapa`). */
export function resolveCargoHydrowayMapModel(cargo: Cargo): HydrowayMapModel | null {
  const cargoId = normalizeCargoId(cargo.id);
  const tracking = getCargoWaterwayTracking(cargoId);
  const rawModel = adaptCargoToHydrowayMapModel({ cargo, tracking });
  const model = sanitizeHydrowayMapModel(rawModel);

  logProductModelResolved(model, cargoId);
  return model;
}
