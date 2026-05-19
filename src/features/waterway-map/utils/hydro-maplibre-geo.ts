import type { HydrowayGeoFeatureCollection, HydrowayGeoRichMetadata } from '../domain/hydroway-geo.types';
import type { HydrowayGeoJsonSources } from '../domain/hydroway-map-model.types';
import {
  hydrowayImportanceSortKey,
  hydrowayPortLabelSortKey,
  resolveHydrowayPortDisplayLabel,
  resolveHydrowayWaterwayDisplayLabel,
  sanitizeHydrowayDisplayLabel,
} from './hydro-maplibre-labels';

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

function enrichLineFeatures(
  collection: HydrowayGeoFeatureCollection,
  resolveLabel: (id: string, name: string, props: GeoProperties) => string,
): HydrowayGeoFeatureCollection {
  return {
    type: 'FeatureCollection',
    features: collection.features.map((feature) => {
      const props = (feature.properties ?? {}) as GeoProperties;
      const id = String(props.id ?? '');
      const name = String(props.name ?? props.displayLabel ?? '');
      const importance = props.importance as HydrowayGeoRichMetadata['importance'];
      const priority = typeof props.priority === 'number' ? props.priority : undefined;
      return {
        ...feature,
        properties: {
          ...feature.properties,
          ...props,
          displayLabel: resolveLabel(id, name, props),
          labelSortKey: hydrowayImportanceSortKey(importance, priority),
        },
      };
    }),
  } as HydrowayGeoFeatureCollection;
}

function enrichPortsTerminals(collection: HydrowayGeoFeatureCollection): HydrowayGeoFeatureCollection {
  return {
    type: 'FeatureCollection',
    features: collection.features.map((feature) => {
      const props = (feature.properties ?? {}) as GeoProperties;
      const id = String(props.id ?? '');
      const name = String(props.name ?? '');
      const kind = String(props.kind ?? 'port');
      const importance = props.importance as HydrowayGeoRichMetadata['importance'];
      const priority = typeof props.priority === 'number' ? props.priority : undefined;
      return {
        ...feature,
        properties: {
          ...feature.properties,
          ...props,
          displayLabel: resolveHydrowayPortDisplayLabel(id, name, kind),
          labelSortKey: hydrowayPortLabelSortKey(id, kind, importance, priority),
        },
      };
    }),
  } as HydrowayGeoFeatureCollection;
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
    mainRivers: enrichLineFeatures(geo.mainRivers, (id, name, props) =>
      resolveHydrowayWaterwayDisplayLabel(id, name, String(props.waterwayCode ?? '')),
    ),
    navigableCorridors: enrichLineFeatures(geo.navigableCorridors, (id, name) =>
      resolveHydrowayWaterwayDisplayLabel(id, name),
    ),
    portsTerminals: enrichPortsTerminals(geo.portsTerminals),
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
