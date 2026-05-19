import type { HydrowayGeoJsonSources } from '../domain/hydroway-map-model.types';
import { sanitizeHydrowayDisplayLabel } from './hydro-maplibre-labels';

type GeoProperties = Record<string, unknown>;

function enrichFeatureCollection(
  collection: GeoJSON.FeatureCollection,
  labelKey: 'name' | 'displayLabel' = 'name',
): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: collection.features.map((feature) => {
      const props = (feature.properties ?? {}) as GeoProperties;
      const raw = String(props[labelKey] ?? props.name ?? '');
      return {
        ...feature,
        properties: {
          ...props,
          displayLabel: sanitizeHydrowayDisplayLabel(raw),
        },
      };
    }),
  };
}

/** Enriquece fontes GeoJSON com rótulos limpos (sem “mock” no mapa). */
export function enrichHydrowayGeoForMapLibre(
  geo: HydrowayGeoJsonSources,
  progress01: number,
): HydrowayGeoJsonSources {
  const routeTrack = enrichFeatureCollection(geo.routeTrack);
  const routeFeature = routeTrack.features[0];
  if (routeFeature?.properties) {
    routeFeature.properties.progress01 = progress01;
  }

  return {
    ...geo,
    mainRivers: geo.mainRivers,
    navigableCorridors: geo.navigableCorridors,
    portsTerminals: enrichFeatureCollection(geo.portsTerminals),
    routeTrack,
    routeTraveled: enrichFeatureCollection(geo.routeTraveled),
    origin: enrichFeatureCollection(geo.origin),
    destination: enrichFeatureCollection(geo.destination),
    vessel: enrichFeatureCollection(geo.vessel),
    routeBounds: geo.routeBounds,
  };
}

export function extractRouteTrackCoordinates(geo: HydrowayGeoJsonSources): GeoJSON.Position[] {
  const feature = geo.routeTrack.features[0];
  if (!feature || feature.geometry.type !== 'LineString') return [];
  return feature.geometry.coordinates;
}
