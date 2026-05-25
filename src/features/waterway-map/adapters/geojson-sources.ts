import type { WaterwayCorridorId } from '@/features/waterway-tracking/domain/waterway-corridor.types';

import type { HydrowayGeoFeatureProperties } from '../domain/hydroway-geo.types';
import type { HydrowayGeoJsonSources } from '../domain/hydroway-map-model.types';
import { HYDROWAY_GEOJSON_SOURCE_IDS } from '../data/hydroway-geo-source-ids';
import type { HydrowayRouteGeometry } from './route-geometry';

export { HYDROWAY_GEOJSON_SOURCE_IDS };

export type BuildHydrowayDynamicGeoSourcesInput = {
  cargoId: string;
  corridorId: WaterwayCorridorId;
  routeName: string;
  originLabel: string;
  destinationLabel: string;
  progress01: number;
  geometry: HydrowayRouteGeometry;
  routeSource: 'demo-geojson' | 'fallback-line';
  originUsedFallback: boolean;
  destinationUsedFallback: boolean;
  vesselName?: string;
};

function featureCollection(features: GeoJSON.Feature[]): GeoJSON.FeatureCollection {
  return Object.freeze({
    type: 'FeatureCollection',
    features: Object.freeze(features),
  }) as GeoJSON.FeatureCollection;
}

function lineFeature(
  id: string,
  name: string,
  kind: HydrowayGeoFeatureProperties['kind'],
  coordinates: GeoJSON.Position[],
  extra: Partial<HydrowayGeoFeatureProperties> = {},
): GeoJSON.Feature<GeoJSON.LineString, HydrowayGeoFeatureProperties> {
  return {
    type: 'Feature',
    properties: {
      id,
      name,
      kind,
      ...extra,
    },
    geometry: {
      type: 'LineString',
      coordinates,
    },
  };
}

function pointFeature(
  id: string,
  name: string,
  kind: HydrowayGeoFeatureProperties['kind'],
  coordinates: GeoJSON.Position,
  extra: Partial<HydrowayGeoFeatureProperties> = {},
): GeoJSON.Feature<GeoJSON.Point, HydrowayGeoFeatureProperties> {
  return {
    type: 'Feature',
    properties: {
      id,
      name,
      kind,
      ...extra,
    },
    geometry: {
      type: 'Point',
      coordinates,
    },
  };
}

/** Monta fontes dinâmicas (rota, extremidades, embarcação) a partir da geometria resolvida. */
export function buildHydrowayDynamicGeoSources(
  input: BuildHydrowayDynamicGeoSourcesInput,
): Pick<
  HydrowayGeoJsonSources,
  'routeTrack' | 'routeTraveled' | 'origin' | 'destination' | 'vessel' | 'routeBounds'
> {
  const {
    cargoId,
    corridorId,
    routeName,
    originLabel,
    destinationLabel,
    progress01,
    geometry,
    routeSource,
    originUsedFallback,
    destinationUsedFallback,
    vesselName,
  } = input;

  const routeExtra: Partial<HydrowayGeoFeatureProperties> = {
    cargoId,
    corridorId,
    classification: routeSource,
  };

  const routeTrack = featureCollection([
    lineFeature(`route-track-${cargoId}`, routeName, 'route', geometry.routeTrack, routeExtra),
  ]);

  const routeTraveled = featureCollection([
    lineFeature(`route-traveled-${cargoId}`, `${routeName} (percorrido)`, 'route', geometry.routeTraveled, {
      ...routeExtra,
      classification: 'traveled',
    }),
  ]);

  const origin = featureCollection([
    pointFeature(`origin-${cargoId}`, originLabel, 'origin', geometry.origin, {
      cargoId,
      corridorId,
      ...(originUsedFallback ? { classification: 'fallback' } : {}),
    }),
  ]);

  const destination = featureCollection([
    pointFeature(`destination-${cargoId}`, destinationLabel, 'destination', geometry.destination, {
      cargoId,
      corridorId,
      ...(destinationUsedFallback ? { classification: 'fallback' } : {}),
    }),
  ]);

  const vessel = featureCollection([
    pointFeature(
      `vessel-${cargoId}`,
      vesselName ?? `Embarcação ${cargoId}`,
      'vessel',
      geometry.vessel,
      {
        cargoId,
        corridorId,
        heading: geometry.heading,
      },
    ),
  ]);

  const routeBounds = featureCollection([
    lineFeature(`route-bounds-${cargoId}`, 'Route bounds', 'route', [
      geometry.origin,
      geometry.vessel,
      geometry.destination,
    ], {
      cargoId,
      classification: 'bounds',
    }),
  ]);

  return {
    routeTrack,
    routeTraveled,
    origin,
    destination,
    vessel,
    routeBounds,
  };
}
