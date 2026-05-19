import type {
  ExpressionSpecification,
  LayerSpecification,
  SourceSpecification,
  StyleSpecification,
} from 'maplibre-gl';

import { HYDROWAY_GEOJSON_SOURCE_IDS } from '../data/hydroway-geo-source-ids';
import { createHydroMapDepthMaskGeoJson, createHydroMapGridGeoJson } from './hydro-map-grid';
import { hydroMapStyleTokens } from './hydro-map-style';
import { buildRouteLineGradientExpression } from './hydro-maplibre-route-style';

export const HYDRO_MAPLIBRE_SOURCE_IDS = {
  grid: 'hydro-spike-grid',
  depthMask: 'hydro-spike-depth-mask',
} as const;

export const HYDRO_MAPLIBRE_LAYER_GROUPS = {
  basemap: ['hydro-background', 'hydro-depth-basin', 'hydro-depth-focus', 'hydro-grid'],
  waterwayMain: [
    'waterway-river-bed',
    'waterway-river-casing',
    'waterway-river-glow',
    'waterway-river-core',
    'waterway-river-highlight',
  ],
  waterwayTributary: [
    'waterway-tributary-bed',
    'waterway-tributary-casing',
    'waterway-tributary-core',
  ],
  corridors: [
    'navigable-corridor-casing',
    'navigable-corridor-glow',
    'navigable-corridor-core',
  ],
  route: [
    'route-planned-casing',
    'route-planned-gradient',
    'route-traveled-glow',
    'route-traveled-core',
  ],
  ports: ['ports-halo', 'ports-symbol'],
  operations: [
    'ops-origin-halo',
    'ops-origin-symbol',
    'ops-origin-label',
    'ops-destination-halo',
    'ops-destination-symbol',
    'ops-destination-label',
    'ops-vessel-halo-symbol',
    'ops-vessel-symbol',
    'ops-vessel-label',
  ],
} as const;

const emptyCollection = (): GeoJSON.FeatureCollection => ({
  type: 'FeatureCollection',
  features: [],
});

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

const zoomOpacity = (z4: number, z8: number, z12: number): ExpressionSpecification => [
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

function geoSource(id: string, lineMetrics = false): SourceSpecification {
  return {
    type: 'geojson',
    data: emptyCollection(),
    ...(lineMetrics ? { lineMetrics: true } : {}),
  };
}

/**
 * Style MapLibre V2.3z — cartografia hidroviária nativa (sem tiles/APIs pagas).
 * Ícones registrados em runtime via `registerHydroMapLibreImages`.
 */
export function createHydroMapLibreBaseStyle(initialProgress01 = 0.15): StyleSpecification {
  const routeGradient = buildRouteLineGradientExpression(initialProgress01) as ExpressionSpecification;

  const sources: Record<string, SourceSpecification> = {
    [HYDRO_MAPLIBRE_SOURCE_IDS.depthMask]: {
      type: 'geojson',
      data: createHydroMapDepthMaskGeoJson(),
    },
    [HYDRO_MAPLIBRE_SOURCE_IDS.grid]: {
      type: 'geojson',
      data: createHydroMapGridGeoJson(),
    },
    [HYDROWAY_GEOJSON_SOURCE_IDS.mainRivers]: geoSource(HYDROWAY_GEOJSON_SOURCE_IDS.mainRivers),
    [HYDROWAY_GEOJSON_SOURCE_IDS.navigableCorridors]: geoSource(HYDROWAY_GEOJSON_SOURCE_IDS.navigableCorridors),
    [HYDROWAY_GEOJSON_SOURCE_IDS.portsTerminals]: geoSource(HYDROWAY_GEOJSON_SOURCE_IDS.portsTerminals),
    [HYDROWAY_GEOJSON_SOURCE_IDS.routeTrack]: geoSource(HYDROWAY_GEOJSON_SOURCE_IDS.routeTrack, true),
    [HYDROWAY_GEOJSON_SOURCE_IDS.routeTraveled]: geoSource(HYDROWAY_GEOJSON_SOURCE_IDS.routeTraveled, true),
    [HYDROWAY_GEOJSON_SOURCE_IDS.origin]: geoSource(HYDROWAY_GEOJSON_SOURCE_IDS.origin),
    [HYDROWAY_GEOJSON_SOURCE_IDS.destination]: geoSource(HYDROWAY_GEOJSON_SOURCE_IDS.destination),
    [HYDROWAY_GEOJSON_SOURCE_IDS.vessel]: geoSource(HYDROWAY_GEOJSON_SOURCE_IDS.vessel),
  };

  const layers: LayerSpecification[] = [
    {
      id: 'hydro-background',
      type: 'background',
      paint: { 'background-color': hydroMapStyleTokens.background },
    },
    {
      id: 'hydro-depth-basin',
      type: 'fill',
      source: HYDRO_MAPLIBRE_SOURCE_IDS.depthMask,
      filter: ['==', ['get', 'kind'], 'depth'],
      paint: {
        'fill-color': hydroMapStyleTokens.backgroundDeep,
        'fill-opacity': zoomOpacity(0.65, 0.55, 0.45),
      },
    },
    {
      id: 'hydro-depth-focus',
      type: 'fill',
      source: HYDRO_MAPLIBRE_SOURCE_IDS.depthMask,
      filter: ['==', ['get', 'kind'], 'depth-focus'],
      paint: {
        'fill-color': hydroMapStyleTokens.depthGlow,
        'fill-opacity': zoomOpacity(0.5, 0.42, 0.35),
      },
    },
    {
      id: 'hydro-grid',
      type: 'line',
      source: HYDRO_MAPLIBRE_SOURCE_IDS.grid,
      paint: {
        'line-color': hydroMapStyleTokens.gridLine,
        'line-width': 0.5,
        'line-opacity': zoomOpacity(0.35, 0.42, 0.5),
      },
    },
    {
      id: 'waterway-river-bed',
      type: 'line',
      source: HYDROWAY_GEOJSON_SOURCE_IDS.mainRivers,
      filter: ['==', ['get', 'kind'], 'river'],
      paint: {
        'line-color': hydroMapStyleTokens.riverCasing,
        'line-width': zoomWidth(24, 36, 48),
        'line-opacity': 0.55,
        'line-blur': 5,
      },
    },
    {
      id: 'waterway-river-casing',
      type: 'line',
      source: HYDROWAY_GEOJSON_SOURCE_IDS.mainRivers,
      filter: ['==', ['get', 'kind'], 'river'],
      paint: {
        'line-color': hydroMapStyleTokens.riverCasing,
        'line-width': zoomWidth(18, 28, 36),
        'line-opacity': 0.9,
        'line-blur': 2.5,
      },
    },
    {
      id: 'waterway-river-glow',
      type: 'line',
      source: HYDROWAY_GEOJSON_SOURCE_IDS.mainRivers,
      filter: ['==', ['get', 'kind'], 'river'],
      paint: {
        'line-color': hydroMapStyleTokens.riverGlow,
        'line-width': zoomWidth(10, 16, 22),
        'line-opacity': 0.7,
        'line-blur': 3,
      },
    },
    {
      id: 'waterway-river-core',
      type: 'line',
      source: HYDROWAY_GEOJSON_SOURCE_IDS.mainRivers,
      filter: ['==', ['get', 'kind'], 'river'],
      paint: {
        'line-color': hydroMapStyleTokens.riverStroke,
        'line-width': zoomWidth(6, 10, 14),
        'line-opacity': 0.95,
      },
    },
    {
      id: 'waterway-river-highlight',
      type: 'line',
      source: HYDROWAY_GEOJSON_SOURCE_IDS.mainRivers,
      filter: ['==', ['get', 'kind'], 'river'],
      paint: {
        'line-color': 'rgba(120, 210, 255, 0.35)',
        'line-width': zoomWidth(2, 3.5, 5),
        'line-opacity': 0.85,
      },
    },
    {
      id: 'waterway-tributary-bed',
      type: 'line',
      source: HYDROWAY_GEOJSON_SOURCE_IDS.mainRivers,
      filter: ['==', ['get', 'kind'], 'tributary'],
      paint: {
        'line-color': hydroMapStyleTokens.tributaryCasing,
        'line-width': zoomWidth(14, 22, 28),
        'line-opacity': 0.5,
        'line-blur': 3,
      },
    },
    {
      id: 'waterway-tributary-casing',
      type: 'line',
      source: HYDROWAY_GEOJSON_SOURCE_IDS.mainRivers,
      filter: ['==', ['get', 'kind'], 'tributary'],
      paint: {
        'line-color': hydroMapStyleTokens.tributaryCasing,
        'line-width': zoomWidth(10, 16, 20),
        'line-opacity': 0.82,
        'line-blur': 1.5,
      },
    },
    {
      id: 'waterway-tributary-core',
      type: 'line',
      source: HYDROWAY_GEOJSON_SOURCE_IDS.mainRivers,
      filter: ['==', ['get', 'kind'], 'tributary'],
      paint: {
        'line-color': hydroMapStyleTokens.tributaryStroke,
        'line-width': zoomWidth(4, 7, 10),
        'line-opacity': 0.8,
      },
    },
    {
      id: 'navigable-corridor-casing',
      type: 'line',
      source: HYDROWAY_GEOJSON_SOURCE_IDS.navigableCorridors,
      paint: {
        'line-color': hydroMapStyleTokens.corridorGlow,
        'line-width': zoomWidth(5, 8, 11),
        'line-opacity': 0.35,
        'line-blur': 2,
      },
    },
    {
      id: 'navigable-corridor-glow',
      type: 'line',
      source: HYDROWAY_GEOJSON_SOURCE_IDS.navigableCorridors,
      paint: {
        'line-color': hydroMapStyleTokens.corridorGlow,
        'line-width': zoomWidth(3, 5, 7),
        'line-opacity': 0.5,
      },
    },
    {
      id: 'navigable-corridor-core',
      type: 'line',
      source: HYDROWAY_GEOJSON_SOURCE_IDS.navigableCorridors,
      filter: ['==', ['get', 'kind'], 'corridor'],
      paint: {
        'line-color': [
          'match',
          ['get', 'corridorId'],
          'tocantins-araguaia',
          hydroMapStyleTokens.hydroviaStroke,
          'madeira',
          hydroMapStyleTokens.canalStroke,
          hydroMapStyleTokens.corridorStroke,
        ],
        'line-width': zoomWidth(2, 3.5, 5),
        'line-dasharray': [4, 2],
        'line-opacity': 0.78,
      },
    },
    {
      id: 'route-planned-casing',
      type: 'line',
      source: HYDROWAY_GEOJSON_SOURCE_IDS.routeTrack,
      paint: {
        'line-color': hydroMapStyleTokens.routeTrackCasing,
        'line-width': zoomWidth(6, 10, 14),
        'line-opacity': 0.75,
        'line-blur': 2,
      },
    },
    {
      id: 'route-planned-gradient',
      type: 'line',
      source: HYDROWAY_GEOJSON_SOURCE_IDS.routeTrack,
      paint: {
        'line-gradient': routeGradient,
        'line-width': zoomWidth(4, 7, 10),
        'line-opacity': 0.92,
      },
    },
    {
      id: 'route-traveled-glow',
      type: 'line',
      source: HYDROWAY_GEOJSON_SOURCE_IDS.routeTraveled,
      paint: {
        'line-color': hydroMapStyleTokens.routeActiveGlow,
        'line-width': zoomWidth(8, 12, 16),
        'line-opacity': 0.6,
        'line-blur': 4,
      },
    },
    {
      id: 'route-traveled-core',
      type: 'line',
      source: HYDROWAY_GEOJSON_SOURCE_IDS.routeTraveled,
      paint: {
        'line-color': hydroMapStyleTokens.routeProgress,
        'line-width': zoomWidth(4.5, 7, 9),
        'line-opacity': 1,
      },
    },
    {
      id: 'ports-halo',
      type: 'circle',
      source: HYDROWAY_GEOJSON_SOURCE_IDS.portsTerminals,
      minzoom: 5.5,
      paint: {
        'circle-color': hydroMapStyleTokens.corridorGlow,
        'circle-radius': zoomWidth(5, 7, 9),
        'circle-opacity': 0.28,
        'circle-blur': 0.9,
      },
    },
    {
      id: 'ports-symbol',
      type: 'symbol',
      source: HYDROWAY_GEOJSON_SOURCE_IDS.portsTerminals,
      minzoom: 6,
      layout: {
        'icon-image': [
          'match',
          ['get', 'kind'],
          'terminal',
          'hydro-terminal',
          'hydro-port',
        ],
        'icon-size': ['interpolate', ['linear'], ['zoom'], 6, 0.65, 10, 0.95],
        'icon-allow-overlap': false,
      },
      paint: {
        'icon-opacity': 0.88,
      },
    },
    {
      id: 'ops-origin-halo',
      type: 'circle',
      source: HYDROWAY_GEOJSON_SOURCE_IDS.origin,
      paint: {
        'circle-color': hydroMapStyleTokens.endpointOriginRing,
        'circle-radius': zoomWidth(12, 16, 20),
        'circle-opacity': 0.45,
        'circle-blur': 0.6,
      },
    },
    {
      id: 'ops-origin-symbol',
      type: 'symbol',
      source: HYDROWAY_GEOJSON_SOURCE_IDS.origin,
      layout: {
        'icon-image': 'hydro-origin',
        'icon-size': ['interpolate', ['linear'], ['zoom'], 4, 0.75, 10, 1.05],
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
      },
    },
    {
      id: 'ops-origin-label',
      type: 'symbol',
      source: HYDROWAY_GEOJSON_SOURCE_IDS.origin,
      minzoom: 5,
      layout: {
        'text-field': ['get', 'displayLabel'],
        'text-size': 11,
        'text-offset': [0, 1.35],
        'text-anchor': 'top',
        'text-max-width': 9,
        'text-allow-overlap': false,
      },
      paint: {
        'text-color': hydroMapStyleTokens.cityLabel,
        'text-halo-color': hydroMapStyleTokens.background,
        'text-halo-width': 1.2,
      },
    },
    {
      id: 'ops-destination-halo',
      type: 'circle',
      source: HYDROWAY_GEOJSON_SOURCE_IDS.destination,
      paint: {
        'circle-color': hydroMapStyleTokens.endpointDestinationRing,
        'circle-radius': zoomWidth(12, 16, 20),
        'circle-opacity': 0.45,
        'circle-blur': 0.6,
      },
    },
    {
      id: 'ops-destination-symbol',
      type: 'symbol',
      source: HYDROWAY_GEOJSON_SOURCE_IDS.destination,
      layout: {
        'icon-image': 'hydro-destination',
        'icon-size': ['interpolate', ['linear'], ['zoom'], 4, 0.75, 10, 1.05],
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
      },
    },
    {
      id: 'ops-destination-label',
      type: 'symbol',
      source: HYDROWAY_GEOJSON_SOURCE_IDS.destination,
      minzoom: 5,
      layout: {
        'text-field': ['get', 'displayLabel'],
        'text-size': 11,
        'text-offset': [0, 1.35],
        'text-anchor': 'top',
        'text-max-width': 9,
        'text-allow-overlap': false,
      },
      paint: {
        'text-color': hydroMapStyleTokens.cityLabel,
        'text-halo-color': hydroMapStyleTokens.background,
        'text-halo-width': 1.2,
      },
    },
    {
      id: 'ops-vessel-halo-symbol',
      type: 'symbol',
      source: HYDROWAY_GEOJSON_SOURCE_IDS.vessel,
      layout: {
        'icon-image': 'hydro-vessel-halo',
        'icon-size': ['interpolate', ['linear'], ['zoom'], 4, 0.85, 10, 1.2],
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
        'icon-rotate': ['coalesce', ['get', 'heading'], 0],
      },
      paint: {
        'icon-opacity': 0.75,
      },
    },
    {
      id: 'ops-vessel-symbol',
      type: 'symbol',
      source: HYDROWAY_GEOJSON_SOURCE_IDS.vessel,
      layout: {
        'icon-image': 'hydro-vessel',
        'icon-size': ['interpolate', ['linear'], ['zoom'], 4, 0.8, 10, 1.1],
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
        'icon-rotate': ['coalesce', ['get', 'heading'], 0],
      },
    },
    {
      id: 'ops-vessel-label',
      type: 'symbol',
      source: HYDROWAY_GEOJSON_SOURCE_IDS.vessel,
      minzoom: 6,
      layout: {
        'text-field': ['get', 'displayLabel'],
        'text-size': 10,
        'text-offset': [0, 1.5],
        'text-anchor': 'top',
        'text-max-width': 8,
        'text-allow-overlap': false,
      },
      paint: {
        'text-color': '#aaf8f0',
        'text-halo-color': hydroMapStyleTokens.background,
        'text-halo-width': 1.2,
      },
    },
  ];

  return {
    version: 8,
    name: 'hydroway-spike-cartography-v23z',
    sources,
    layers,
  };
}

/** Atualiza line-gradient da rota planejada conforme progresso da carga. */
export function buildRouteGradientPaint(progress01: number): {
  'line-gradient': ExpressionSpecification;
} {
  return {
    'line-gradient': buildRouteLineGradientExpression(progress01) as ExpressionSpecification,
  };
}
