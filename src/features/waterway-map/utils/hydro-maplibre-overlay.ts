import type {
  ExpressionSpecification,
  GeoJSONSource,
  LayerSpecification,
  Map,
  SourceSpecification,
} from 'maplibre-gl';

import { HYDROWAY_GEOJSON_SOURCE_IDS } from '../data/hydroway-geo-source-ids';
import type { HydrowayGeoJsonSources } from '../domain/hydroway-map-model.types';
import {
  buildRouteTraveledGeoJson,
  buildVesselGeoJson,
} from './hydro-maplibre-animation';
import { extractRouteTrackCoordinates } from './hydro-maplibre-geo';

export const HYDROWAY_MVP_OVERLAY_SOURCE_IDS = {
  routePoints: 'hydroway-route-points',
} as const;

/** Layers MVP V2.7c — overlay limpo sobre basemap OpenFreeMap (dev only). */
export const HYDROWAY_MVP_OVERLAY_LAYER_IDS = {
  waterwayMain: 'hydri-waterway-main',
  waterwayCorridor: 'hydri-waterway-corridor',
  routeTrackCasing: 'hydri-route-track-casing',
  routeTrackCore: 'hydri-route-track-core',
  routeTraveledCore: 'hydri-route-traveled-core',
  routePoints: 'hydri-route-points',
} as const;

export const HYDROWAY_MVP_LAYER_GROUPS = {
  waterwayMain: [HYDROWAY_MVP_OVERLAY_LAYER_IDS.waterwayMain],
  waterwayTributary: [] as string[],
  waterwaySecondary: [HYDROWAY_MVP_OVERLAY_LAYER_IDS.waterwayCorridor],
  cargoRoute: [
    HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeTrackCasing,
    HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeTrackCore,
    HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeTraveledCore,
    HYDROWAY_MVP_OVERLAY_LAYER_IDS.routePoints,
  ],
  ports: [] as string[],
  vessel: [HYDROWAY_MVP_OVERLAY_LAYER_IDS.routePoints],
} as const;

const zoomWidth = (z4: number, z8: number, z12: number): ExpressionSpecification => [
  'interpolate',
  ['linear'],
  ['zoom'],
  4,
  z4,
  8,
  z8,
  12,
  z12,
];

function emptyCollection(): GeoJSON.FeatureCollection {
  return { type: 'FeatureCollection', features: [] };
}

export function buildRoutePointsGeoJson(
  origin: GeoJSON.FeatureCollection,
  destination: GeoJSON.FeatureCollection,
  vessel: GeoJSON.FeatureCollection,
): GeoJSON.FeatureCollection {
  const features: GeoJSON.Feature[] = [];

  for (const collection of [origin, destination, vessel]) {
    const feature = collection.features[0];
    if (!feature || feature.geometry.type !== 'Point') continue;
    const kind = String(feature.properties?.kind ?? 'point');
    features.push({
      type: 'Feature',
      properties: {
        ...feature.properties,
        kind,
      },
      geometry: feature.geometry,
    });
  }

  return { type: 'FeatureCollection', features };
}

export function getHydrowayMvpOverlayLayerDefinitions(): LayerSpecification[] {
  return [
    {
      id: HYDROWAY_MVP_OVERLAY_LAYER_IDS.waterwayMain,
      type: 'line',
      source: HYDROWAY_GEOJSON_SOURCE_IDS.mainRivers,
      filter: ['==', ['get', 'kind'], 'river'],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': 'rgba(42, 118, 168, 0.62)',
        'line-width': zoomWidth(2, 3.5, 5),
        'line-opacity': 0.78,
      },
    },
    {
      id: HYDROWAY_MVP_OVERLAY_LAYER_IDS.waterwayCorridor,
      type: 'line',
      source: HYDROWAY_GEOJSON_SOURCE_IDS.navigableCorridors,
      filter: ['==', ['get', 'kind'], 'corridor'],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': 'rgba(58, 132, 188, 0.55)',
        'line-width': zoomWidth(1.5, 2.5, 3.5),
        'line-dasharray': [3, 2],
        'line-opacity': 0.72,
      },
    },
    {
      id: HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeTrackCasing,
      type: 'line',
      source: HYDROWAY_GEOJSON_SOURCE_IDS.routeTrack,
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': 'rgba(3, 20, 31, 0.90)',
        'line-width': zoomWidth(5, 8, 12),
      },
    },
    {
      id: HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeTrackCore,
      type: 'line',
      source: HYDROWAY_GEOJSON_SOURCE_IDS.routeTrack,
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': 'rgba(63, 190, 220, 0.68)',
        'line-width': zoomWidth(2, 4, 6),
        'line-opacity': 0.84,
      },
    },
    {
      id: HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeTraveledCore,
      type: 'line',
      source: HYDROWAY_GEOJSON_SOURCE_IDS.routeTraveled,
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': 'rgba(113, 239, 214, 0.92)',
        'line-width': zoomWidth(2.5, 5, 7),
        'line-opacity': 0.92,
      },
    },
    {
      id: HYDROWAY_MVP_OVERLAY_LAYER_IDS.routePoints,
      type: 'circle',
      source: HYDROWAY_MVP_OVERLAY_SOURCE_IDS.routePoints,
      paint: {
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          4,
          ['match', ['get', 'kind'], 'vessel', 7, 'origin', 5, 'destination', 5, 4],
          10,
          ['match', ['get', 'kind'], 'vessel', 12, 'origin', 8, 'destination', 8, 6],
          14,
          ['match', ['get', 'kind'], 'vessel', 16, 'origin', 10, 'destination', 10, 7],
        ],
        'circle-color': [
          'match',
          ['get', 'kind'],
          'vessel',
          '#7fffd4',
          'origin',
          '#2ee6a6',
          'destination',
          '#5fd0ff',
          '#ffffff',
        ],
        'circle-stroke-color': 'rgba(4, 12, 20, 0.95)',
        'circle-stroke-width': 2,
        'circle-opacity': 0.92,
      },
    },
  ];
}

function geoJsonSource(data: GeoJSON.FeatureCollection = emptyCollection()): SourceSpecification {
  return { type: 'geojson', data };
}

export function installHydrowayMapLibreOverlay(map: Map, geo: HydrowayGeoJsonSources): void {
  const sources: Record<string, SourceSpecification> = {
    [HYDROWAY_GEOJSON_SOURCE_IDS.mainRivers]: geoJsonSource(geo.mainRivers),
    [HYDROWAY_GEOJSON_SOURCE_IDS.navigableCorridors]: geoJsonSource(geo.navigableCorridors),
    [HYDROWAY_GEOJSON_SOURCE_IDS.routeTrack]: geoJsonSource(geo.routeTrack),
    [HYDROWAY_GEOJSON_SOURCE_IDS.routeTraveled]: geoJsonSource(geo.routeTraveled),
    [HYDROWAY_MVP_OVERLAY_SOURCE_IDS.routePoints]: geoJsonSource(
      buildRoutePointsGeoJson(geo.origin, geo.destination, geo.vessel),
    ),
  };

  for (const [id, spec] of Object.entries(sources)) {
    if (!map.getSource(id)) {
      map.addSource(id, spec);
    }
  }

  for (const layer of getHydrowayMvpOverlayLayerDefinitions()) {
    if (!map.getLayer(layer.id)) {
      map.addLayer(layer);
    }
  }
}

export function syncHydrowayMapLibreOverlayData(
  map: Map,
  geo: HydrowayGeoJsonSources,
  progress01: number,
  routeTrackCoords: GeoJSON.Position[],
): void {
  const setSource = (sourceId: string, data: GeoJSON.FeatureCollection) => {
    const source = map.getSource(sourceId);
    if (source && 'setData' in source) {
      (source as GeoJSONSource).setData(data);
    }
  };

  setSource(HYDROWAY_GEOJSON_SOURCE_IDS.mainRivers, geo.mainRivers);
  setSource(HYDROWAY_GEOJSON_SOURCE_IDS.navigableCorridors, geo.navigableCorridors);
  setSource(HYDROWAY_GEOJSON_SOURCE_IDS.routeTrack, geo.routeTrack);

  const routeProps = geo.routeTraveled.features[0]?.properties ?? {};
  const vesselProps = geo.vessel.features[0]?.properties ?? {};
  const vesselLabel = String(geo.vessel.features[0]?.properties?.displayLabel ?? '') || 'Embarcação';

  if (routeTrackCoords.length >= 2) {
    setSource(
      HYDROWAY_GEOJSON_SOURCE_IDS.routeTraveled,
      buildRouteTraveledGeoJson(routeTrackCoords, progress01, routeProps),
    );
    const vesselFc = buildVesselGeoJson(routeTrackCoords, progress01, vesselLabel, vesselProps);
    setSource(
      HYDROWAY_MVP_OVERLAY_SOURCE_IDS.routePoints,
      buildRoutePointsGeoJson(geo.origin, geo.destination, vesselFc),
    );
  } else {
    setSource(HYDROWAY_GEOJSON_SOURCE_IDS.routeTraveled, geo.routeTraveled);
    setSource(
      HYDROWAY_MVP_OVERLAY_SOURCE_IDS.routePoints,
      buildRoutePointsGeoJson(geo.origin, geo.destination, geo.vessel),
    );
  }
}

export function extractOverlayRouteTrackCoordinates(geo: HydrowayGeoJsonSources): GeoJSON.Position[] {
  return extractRouteTrackCoordinates(geo);
}
