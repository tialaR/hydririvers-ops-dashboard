import type {
  ExpressionSpecification,
  GeoJSONSource,
  LayerSpecification,
  Map,
  SourceSpecification,
} from 'maplibre-gl';

import { HYDROWAY_GEOJSON_SOURCE_IDS } from '../data/hydroway-geo-source-ids';
import type { HydrowayGeoJsonSources } from '../domain/hydroway-map-model.types';
import { buildRouteTraveledGeoJson } from './hydro-maplibre-animation';
import type { RouteMarkerKind } from './hydro-maplibre-route-markers';

import { HYDRI_CARGO_BOAT_MARKER_SVG_URL } from '../constants/hydro-cargo-boat-marker';
import { resolveEffectiveRouteTrack, sanitizeRouteTrackCoordinates } from './hydro-maplibre-geo';
import {
  getCoordinateAtRouteProgress,
  getRouteDestinationCoordinate,
  getRouteOriginCoordinate,
  resolveRouteMarkerCoordinates,
  type RouteMarkerCoordinates,
} from './route-marker-geometry';
import {
  buildRouteRemainingFlowGradientExpression,
  buildRouteTraveledFlowGradientExpression,
  resolveRouteDestinationFlowPaint,
  resolveRoutePointPulsePaint,
  resolveRouteRiverMistPaint,
  ROUTE_RIVER_COLORS,
  type RoutePointPulseKind,
} from './hydro-maplibre-route-style';

/** @deprecated Prefer `HYDRI_CARGO_BOAT_MARKER_SVG_URL` from `hydro-cargo-boat-marker`. */
export const HYDRI_CURRENT_CARGO_BOAT_MARKER_SVG_URL = HYDRI_CARGO_BOAT_MARKER_SVG_URL;

export const HYDROWAY_ROUTE_MARKERS_SOURCE_ID = 'hydroway-route-markers';

export const HYDROWAY_MVP_OVERLAY_SOURCE_IDS = {
  routePoints: 'hydroway-route-points',
  routeFlow: 'hydroway-route-flow',
  routeMarkers: HYDROWAY_ROUTE_MARKERS_SOURCE_ID,
} as const;

/** Layers MVP V2.7c — overlay limpo sobre basemap OpenFreeMap (dev only). */
export const HYDROWAY_MVP_OVERLAY_LAYER_IDS = {
  waterwayMain: 'hydri-waterway-main',
  waterwayCorridor: 'hydri-waterway-corridor',
  routeTrackCasing: 'hydri-route-track-casing',
  routeTrackGlow: 'hydri-route-track-glow',
  routeTrackCore: 'hydri-route-track-core',
  routeFlowRemaining: 'hydri-route-flow-remaining',
  routeFlowRiverMist: 'hydri-route-flow-river-mist',
  routeFlowDestination: 'hydri-route-flow-destination',
  routeFlowTraveledGlow: 'hydri-route-flow-traveled-glow',
  routeFlowTraveled: 'hydri-route-flow-traveled',
  routePointPulseOrigin: 'hydri-route-point-pulse-origin',
  routePointPulseDestination: 'hydri-route-point-pulse-destination',
  routePointPulseVessel: 'hydri-route-point-pulse-vessel',
  routeMarkerCoreOrigin: 'hydri-route-marker-core-origin',
  routeMarkerCoreDestination: 'hydri-route-marker-core-destination',
  routeMarkerCoreVessel: 'hydri-route-marker-core-vessel',
  routePoints: 'hydri-route-points',
} as const;

export const HYDROWAY_MVP_LAYER_GROUPS = {
  waterwayMain: [HYDROWAY_MVP_OVERLAY_LAYER_IDS.waterwayMain],
  waterwayTributary: [] as string[],
  waterwaySecondary: [HYDROWAY_MVP_OVERLAY_LAYER_IDS.waterwayCorridor],
  cargoRoute: [
    HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeTrackCasing,
    HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeTrackGlow,
    HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeTrackCore,
    HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeFlowRemaining,
    HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeFlowRiverMist,
    HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeFlowDestination,
    HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeFlowTraveledGlow,
    HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeFlowTraveled,
    HYDROWAY_MVP_OVERLAY_LAYER_IDS.routePointPulseOrigin,
    HYDROWAY_MVP_OVERLAY_LAYER_IDS.routePointPulseDestination,
    HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeMarkerCoreOrigin,
    HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeMarkerCoreDestination,
    HYDROWAY_MVP_OVERLAY_LAYER_IDS.routePoints,
  ],
  ports: [] as string[],
  vessel: [
    HYDROWAY_MVP_OVERLAY_LAYER_IDS.routePointPulseVessel,
    HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeMarkerCoreVessel,
  ],
} as const;

const ROUTE_FLOW_REMAINING_OPACITY = { default: 0.3, emphasis: 0.34 } as const;
const ROUTE_FLOW_TRAVELED_OPACITY = { default: 0.72, emphasis: 0.78 } as const;
const ROUTE_FLOW_TRAVELED_GLOW_OPACITY = { default: 0.28, emphasis: 0.34 } as const;

const ROUTE_POINT_PULSE_LAYER_BY_KIND: Record<RoutePointPulseKind, string> = {
  origin: HYDROWAY_MVP_OVERLAY_LAYER_IDS.routePointPulseOrigin,
  destination: HYDROWAY_MVP_OVERLAY_LAYER_IDS.routePointPulseDestination,
  vessel: HYDROWAY_MVP_OVERLAY_LAYER_IDS.routePointPulseVessel,
};

const ROUTE_POINT_PULSE_COLORS: Record<
  RoutePointPulseKind,
  { fill: string; stroke: string }
> = {
  origin: {
    fill: 'rgba(46, 230, 166, 0.12)',
    stroke: 'rgba(46, 230, 166, 0.55)',
  },
  destination: {
    fill: 'rgba(245, 199, 66, 0.12)',
    stroke: 'rgba(245, 199, 66, 0.55)',
  },
  vessel: {
    fill: 'rgba(127, 255, 212, 0.1)',
    stroke: 'rgba(127, 255, 212, 0.45)',
  },
};

const HYDRO_LAYER_PAINT_TARGETS: Record<
  string,
  { property: 'line-opacity'; emphasis: number; default: number }
> = {
  [HYDROWAY_MVP_OVERLAY_LAYER_IDS.waterwayMain]: {
    property: 'line-opacity',
    emphasis: 0.88,
    default: 0.78,
  },
  [HYDROWAY_MVP_OVERLAY_LAYER_IDS.waterwayCorridor]: {
    property: 'line-opacity',
    emphasis: 0.82,
    default: 0.72,
  },
};

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

/** hr-route-base / glow / flow — larguras de referência no zoom 8. */
const ROUTE_BASE_WIDTH = zoomWidth(3.2, 4.8, 6.2);
const ROUTE_GLOW_WIDTH = zoomWidth(5.5, 8.5, 11);
const ROUTE_DEST_FLOW_WIDTH = zoomWidth(3.6, 5.2, 6.8);
const ROUTE_MIST_WIDTH = zoomWidth(4.8, 7.2, 9);
const ROUTE_TRAVELED_WIDTH = zoomWidth(3.4, 5.2, 6.6);
const ROUTE_TRAVELED_GLOW_WIDTH = zoomWidth(4.8, 7.2, 9);

function emptyCollection(): GeoJSON.FeatureCollection {
  return { type: 'FeatureCollection', features: [] };
}

export function isMapLibreOverlayMapUsable(map: Map | null | undefined): map is Map {
  if (!map) return false;
  const removed = (map as Map & { _removed?: boolean })._removed;
  return removed !== true;
}

function isPaintValueValid(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'number') return Number.isFinite(value);
  return true;
}

export function setLayoutIfLayerExists(
  map: Map | null | undefined,
  layerId: string,
  property: string,
  value: unknown,
): void {
  if (!isMapLibreOverlayMapUsable(map) || !map.loaded()) return;
  if (!isPaintValueValid(value)) return;

  try {
    if (typeof map.getLayer !== 'function') return;
    if (!map.getLayer(layerId)) return;
    map.setLayoutProperty(layerId, property, value);
  } catch {
    // Layer may be gone during teardown.
  }
}

function clampProgress01(progress01: number): number {
  if (!Number.isFinite(progress01)) return 0.15;
  return Math.max(0, Math.min(1, progress01));
}

function clampFlowPhase01(flowPhase01: number | undefined): number {
  if (flowPhase01 === undefined || !Number.isFinite(flowPhase01)) return 0;
  return flowPhase01 % 1;
}

export function layerExistsOnMap(map: Map | null | undefined, layerId: string): boolean {
  if (!isMapLibreOverlayMapUsable(map)) return false;
  try {
    if (typeof map.getLayer !== 'function') return false;
    return Boolean(map.getLayer(layerId));
  } catch {
    return false;
  }
}

export function setPaintIfLayerExists(
  map: Map | null | undefined,
  layerId: string,
  property: string,
  value: unknown,
): boolean {
  if (!isMapLibreOverlayMapUsable(map) || !map.loaded()) return false;
  if (!isPaintValueValid(value)) return false;
  if (!layerExistsOnMap(map, layerId)) return false;

  try {
    map.setPaintProperty(layerId, property, value);
    return true;
  } catch {
    return false;
  }
}

export function applyHydroLayerPaintMode(
  map: Map | null | undefined,
  emphasis: boolean,
): { appliedLayerCount: number; hydrographyAvailable: boolean } {
  if (!isMapLibreOverlayMapUsable(map) || !map.loaded()) {
    return { appliedLayerCount: 0, hydrographyAvailable: false };
  }

  let appliedLayerCount = 0;

  for (const [layerId, spec] of Object.entries(HYDRO_LAYER_PAINT_TARGETS)) {
    const value = emphasis ? spec.emphasis : spec.default;
    if (setPaintIfLayerExists(map, layerId, spec.property, value)) {
      appliedLayerCount += 1;
    }
  }

  return {
    appliedLayerCount,
    hydrographyAvailable: appliedLayerCount > 0,
  };
}

function pointFeatureAtCoordinate(
  template: GeoJSON.FeatureCollection,
  coordinates: GeoJSON.Position,
  kind: string,
): GeoJSON.Feature {
  const templateFeature = template.features[0];
  const templateProps = (templateFeature?.properties ?? {}) as Record<string, unknown>;
  return {
    type: 'Feature',
    properties: {
      ...templateProps,
      kind,
    },
    geometry: {
      type: 'Point',
      coordinates,
    },
  };
}

function buildRouteTrackGeoJson(
  template: GeoJSON.FeatureCollection,
  coordinates: GeoJSON.Position[],
): GeoJSON.FeatureCollection {
  const templateFeature = template.features[0];
  if (!templateFeature || coordinates.length < 2) {
    return template;
  }

  return {
    type: 'FeatureCollection',
    features: [
      {
        ...templateFeature,
        geometry: {
          type: 'LineString',
          coordinates,
        },
      },
    ],
  };
}

/** GeoJSON dos marcadores de rota — sempre derivado da LineString ciano renderizada. */
export function buildRouteMarkersGeoJson(
  renderedRouteCoordinates: GeoJSON.Position[],
  progress01: number,
): GeoJSON.FeatureCollection {
  const markers = resolveRouteMarkerCoordinates(
    renderedRouteCoordinates,
    clampProgress01(progress01),
  );

  const entries: Array<{ kind: 'origin' | 'destination' | 'vessel'; coordinate: GeoJSON.Position | null }> =
    [
      { kind: 'origin', coordinate: markers.origin },
      { kind: 'vessel', coordinate: markers.vessel },
      { kind: 'destination', coordinate: markers.destination },
    ];

  const features: GeoJSON.Feature[] = [];

  for (const entry of entries) {
    const coordinate = entry.coordinate;
    if (!coordinate || !isValidLngLat(coordinate)) continue;
    features.push({
      type: 'Feature',
      properties: { kind: entry.kind },
      geometry: {
        type: 'Point',
        coordinates: coordinate,
      },
    });
  }

  return { type: 'FeatureCollection', features };
}

export function buildRoutePointsGeoJson(
  origin: GeoJSON.FeatureCollection,
  destination: GeoJSON.FeatureCollection,
  vessel: GeoJSON.FeatureCollection,
  routeAligned?: RouteMarkerCoordinates,
): GeoJSON.FeatureCollection {
  const features: GeoJSON.Feature[] = [];

  const alignedEntries: Array<{
    kind: string;
    collection: GeoJSON.FeatureCollection;
    coordinate: GeoJSON.Position | null | undefined;
  }> = [
    { kind: 'origin', collection: origin, coordinate: routeAligned?.origin },
    { kind: 'destination', collection: destination, coordinate: routeAligned?.destination },
    { kind: 'vessel', collection: vessel, coordinate: routeAligned?.vessel },
  ];

  const routeOnly = routeAligned !== undefined;

  for (const entry of alignedEntries) {
    const coordinate = entry.coordinate;
    if (coordinate && isValidLngLat(coordinate)) {
      features.push(pointFeatureAtCoordinate(entry.collection, coordinate, entry.kind));
      continue;
    }

    if (routeOnly) continue;

    const feature = entry.collection.features[0];
    if (!feature || feature.geometry.type !== 'Point') continue;
    const kind = String(feature.properties?.kind ?? entry.kind);
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

function buildRoutePointPulseLayer(kind: RoutePointPulseKind): LayerSpecification {
  const colors = ROUTE_POINT_PULSE_COLORS[kind];

  return {
    id: ROUTE_POINT_PULSE_LAYER_BY_KIND[kind],
    type: 'circle',
    source: HYDROWAY_MVP_OVERLAY_SOURCE_IDS.routeMarkers,
    filter: ['==', ['get', 'kind'], kind],
    layout: { visibility: 'visible' },
    paint: {
      'circle-color': colors.fill,
      'circle-stroke-color': colors.stroke,
      'circle-stroke-width': 1.5,
      'circle-radius': 10,
      'circle-opacity': 0,
      'circle-blur': 0.55,
      'circle-stroke-opacity': 0,
    },
  };
}

const ROUTE_MARKER_CORE_COLORS: Record<RoutePointPulseKind, string> = {
  origin: '#2ee6a6',
  vessel: '#7fffd4',
  destination: '#f5c742',
};

function buildRouteMarkerCoreLayer(kind: RoutePointPulseKind): LayerSpecification {
  return {
    id:
      kind === 'origin'
        ? HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeMarkerCoreOrigin
        : kind === 'destination'
          ? HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeMarkerCoreDestination
          : HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeMarkerCoreVessel,
    type: 'circle',
    source: HYDROWAY_MVP_OVERLAY_SOURCE_IDS.routeMarkers,
    filter: ['==', ['get', 'kind'], kind],
    layout: { visibility: 'visible' },
    paint: {
      'circle-radius': [
        'interpolate',
        ['linear'],
        ['zoom'],
        4,
        kind === 'vessel' ? 7 : 5,
        10,
        kind === 'vessel' ? 12 : 8,
        14,
        kind === 'vessel' ? 16 : 10,
      ],
      'circle-color': ROUTE_MARKER_CORE_COLORS[kind],
      'circle-stroke-color': 'rgba(4, 12, 20, 0.95)',
      'circle-stroke-width': 2,
      'circle-opacity': 0.92,
    },
  };
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
        'line-color': 'rgba(8, 28, 42, 0.42)',
        'line-width': zoomWidth(4.2, 6.2, 8.5),
      },
    },
    {
      id: HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeTrackGlow,
      type: 'line',
      source: HYDROWAY_GEOJSON_SOURCE_IDS.routeTrack,
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': ROUTE_RIVER_COLORS.glow,
        'line-width': ROUTE_GLOW_WIDTH,
        'line-opacity': 0.18,
        'line-blur': 1.15,
      },
    },
    {
      id: HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeTrackCore,
      type: 'line',
      source: HYDROWAY_GEOJSON_SOURCE_IDS.routeTrack,
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': ROUTE_RIVER_COLORS.base,
        'line-width': ROUTE_BASE_WIDTH,
        'line-opacity': 0.58,
      },
    },
    {
      id: HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeFlowRemaining,
      type: 'line',
      source: HYDROWAY_MVP_OVERLAY_SOURCE_IDS.routeFlow,
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-gradient': buildRouteRemainingFlowGradientExpression(0.15),
        'line-width': ROUTE_BASE_WIDTH,
        'line-opacity': ROUTE_FLOW_REMAINING_OPACITY.default,
      },
    },
    {
      id: HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeFlowRiverMist,
      type: 'line',
      source: HYDROWAY_MVP_OVERLAY_SOURCE_IDS.routeFlow,
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': ROUTE_RIVER_COLORS.glow,
        'line-width': ROUTE_MIST_WIDTH,
        'line-dasharray': [0, 120, 520],
        'line-opacity': 0.22,
      },
    },
    {
      id: HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeFlowDestination,
      type: 'line',
      source: HYDROWAY_MVP_OVERLAY_SOURCE_IDS.routeFlow,
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': ROUTE_RIVER_COLORS.flow,
        'line-width': ROUTE_DEST_FLOW_WIDTH,
        'line-dasharray': [0, 72, 420],
        'line-opacity': 0.34,
      },
    },
    {
      id: HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeFlowTraveledGlow,
      type: 'line',
      source: HYDROWAY_MVP_OVERLAY_SOURCE_IDS.routeFlow,
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-gradient': buildRouteTraveledFlowGradientExpression(0.15),
        'line-width': ROUTE_TRAVELED_GLOW_WIDTH,
        'line-opacity': ROUTE_FLOW_TRAVELED_GLOW_OPACITY.default,
        'line-blur': 1.15,
      },
    },
    {
      id: HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeFlowTraveled,
      type: 'line',
      source: HYDROWAY_MVP_OVERLAY_SOURCE_IDS.routeFlow,
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-gradient': buildRouteTraveledFlowGradientExpression(0.15),
        'line-width': ROUTE_TRAVELED_WIDTH,
        'line-opacity': ROUTE_FLOW_TRAVELED_OPACITY.default,
      },
    },
    buildRoutePointPulseLayer('origin'),
    buildRoutePointPulseLayer('destination'),
    buildRoutePointPulseLayer('vessel'),
    buildRouteMarkerCoreLayer('origin'),
    buildRouteMarkerCoreLayer('destination'),
    buildRouteMarkerCoreLayer('vessel'),
    {
      id: HYDROWAY_MVP_OVERLAY_LAYER_IDS.routePoints,
      type: 'circle',
      source: HYDROWAY_MVP_OVERLAY_SOURCE_IDS.routePoints,
      filter: [
        '!',
        ['in', ['get', 'kind'], ['literal', ['origin', 'destination', 'vessel']]],
      ],
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

function geoJsonSourceWithLineMetrics(
  data: GeoJSON.FeatureCollection = emptyCollection(),
): SourceSpecification {
  return { type: 'geojson', data, lineMetrics: true };
}

export function installHydrowayMapLibreOverlay(map: Map, geo: HydrowayGeoJsonSources): void {
  const sources: Record<string, SourceSpecification> = {
    [HYDROWAY_GEOJSON_SOURCE_IDS.mainRivers]: geoJsonSource(geo.mainRivers),
    [HYDROWAY_GEOJSON_SOURCE_IDS.navigableCorridors]: geoJsonSource(geo.navigableCorridors),
    [HYDROWAY_GEOJSON_SOURCE_IDS.routeTrack]: geoJsonSource(geo.routeTrack),
    [HYDROWAY_GEOJSON_SOURCE_IDS.routeTraveled]: geoJsonSource(geo.routeTraveled),
    [HYDROWAY_MVP_OVERLAY_SOURCE_IDS.routeFlow]: geoJsonSourceWithLineMetrics(geo.routeTrack),
    [HYDROWAY_MVP_OVERLAY_SOURCE_IDS.routePoints]: geoJsonSource(emptyCollection()),
    [HYDROWAY_MVP_OVERLAY_SOURCE_IDS.routeMarkers]: geoJsonSource(emptyCollection()),
  };

  for (const [id, spec] of Object.entries(sources)) {
    if (!map.getSource(id)) {
      map.addSource(id, spec);
    }
  }

  for (const layer of getHydrowayMvpOverlayLayerDefinitions()) {
    if (!layerExistsOnMap(map, layer.id)) {
      map.addLayer(layer);
    }
  }
}

export type SyncHydrowayMapLibreOverlayResult = {
  /** Mesma LineString usada no GeoJSON da rota ciano (routeTrack + routeFlow). */
  renderedRouteCoordinates: GeoJSON.Position[];
};

export function syncHydrowayMapLibreOverlayData(
  map: Map | null | undefined,
  geo: HydrowayGeoJsonSources,
  progress01: number,
  routeTrackCoords: GeoJSON.Position[],
): SyncHydrowayMapLibreOverlayResult {
  const renderedRouteCoordinates = resolveEffectiveRouteTrack(geo, routeTrackCoords);

  if (!isMapLibreOverlayMapUsable(map)) {
    return { renderedRouteCoordinates };
  }

  const setSource = (sourceId: string, data: GeoJSON.FeatureCollection) => {
    if (!isMapLibreOverlayMapUsable(map)) return;

    try {
      const source = map.getSource(sourceId);
      if (source && 'setData' in source) {
        (source as GeoJSONSource).setData(data);
      }
    } catch {
      // Map may be removing; ignore stale sync.
    }
  };

  setSource(HYDROWAY_GEOJSON_SOURCE_IDS.mainRivers, geo.mainRivers);
  setSource(HYDROWAY_GEOJSON_SOURCE_IDS.navigableCorridors, geo.navigableCorridors);
  const routeProps = geo.routeTraveled.features[0]?.properties ?? {};
  const safeProgress = clampProgress01(progress01);

  if (renderedRouteCoordinates.length >= 2) {
    const routeTrackData = buildRouteTrackGeoJson(geo.routeTrack, renderedRouteCoordinates);
    setSource(HYDROWAY_GEOJSON_SOURCE_IDS.routeTrack, routeTrackData);
    setSource(HYDROWAY_MVP_OVERLAY_SOURCE_IDS.routeFlow, routeTrackData);
    setSource(
      HYDROWAY_GEOJSON_SOURCE_IDS.routeTraveled,
      buildRouteTraveledGeoJson(renderedRouteCoordinates, safeProgress, routeProps),
    );
    setSource(
      HYDROWAY_MVP_OVERLAY_SOURCE_IDS.routeMarkers,
      buildRouteMarkersGeoJson(renderedRouteCoordinates, safeProgress),
    );
    setSource(HYDROWAY_MVP_OVERLAY_SOURCE_IDS.routePoints, emptyCollection());
  } else {
    setSource(HYDROWAY_GEOJSON_SOURCE_IDS.routeTrack, geo.routeTrack);
    setSource(HYDROWAY_MVP_OVERLAY_SOURCE_IDS.routeFlow, geo.routeTrack);
    setSource(HYDROWAY_GEOJSON_SOURCE_IDS.routeTraveled, geo.routeTraveled);
    setSource(HYDROWAY_MVP_OVERLAY_SOURCE_IDS.routeMarkers, emptyCollection());
    setSource(HYDROWAY_MVP_OVERLAY_SOURCE_IDS.routePoints, emptyCollection());
  }

  syncRouteFlowPaint(map, safeProgress);

  return { renderedRouteCoordinates };
}

export function syncRouteFlowPaint(
  map: Map | null | undefined,
  progress01: number,
  options?: {
    hydrographyEmphasis?: boolean;
    flowPhase01?: number;
    elapsedMs?: number;
    reducedMotion?: boolean;
  },
): void {
  if (!isMapLibreOverlayMapUsable(map) || !map.loaded()) return;

  const emphasis = options?.hydrographyEmphasis ?? false;
  const safeProgress = clampProgress01(progress01);
  const flowPhase = clampFlowPhase01(options?.flowPhase01);
  const elapsedMs = Number.isFinite(options?.elapsedMs) ? Math.max(0, options!.elapsedMs!) : 0;
  const reducedMotion = options?.reducedMotion ?? false;
  const traveledGradient = buildRouteTraveledFlowGradientExpression(safeProgress, flowPhase);
  const remainingGradient = buildRouteRemainingFlowGradientExpression(safeProgress, flowPhase);

  const traveledOpacity = emphasis
    ? ROUTE_FLOW_TRAVELED_OPACITY.emphasis
    : ROUTE_FLOW_TRAVELED_OPACITY.default;
  const traveledGlowOpacity = emphasis
    ? ROUTE_FLOW_TRAVELED_GLOW_OPACITY.emphasis
    : ROUTE_FLOW_TRAVELED_GLOW_OPACITY.default;
  const remainingOpacity = emphasis
    ? ROUTE_FLOW_REMAINING_OPACITY.emphasis
    : ROUTE_FLOW_REMAINING_OPACITY.default;

  const destinationFlow = resolveRouteDestinationFlowPaint(elapsedMs, reducedMotion);
  const riverMist = resolveRouteRiverMistPaint(elapsedMs, reducedMotion);

  setPaintIfLayerExists(
    map,
    HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeFlowTraveledGlow,
    'line-gradient',
    traveledGradient,
  );
  setPaintIfLayerExists(
    map,
    HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeFlowTraveledGlow,
    'line-opacity',
    traveledGlowOpacity,
  );
  setPaintIfLayerExists(
    map,
    HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeFlowTraveled,
    'line-gradient',
    traveledGradient,
  );
  setPaintIfLayerExists(
    map,
    HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeFlowTraveled,
    'line-opacity',
    traveledOpacity,
  );
  setPaintIfLayerExists(
    map,
    HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeFlowRemaining,
    'line-gradient',
    remainingGradient,
  );
  setPaintIfLayerExists(
    map,
    HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeFlowRemaining,
    'line-opacity',
    remainingOpacity,
  );
  setPaintIfLayerExists(
    map,
    HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeFlowDestination,
    'line-dasharray',
    destinationFlow['line-dasharray'],
  );
  setPaintIfLayerExists(
    map,
    HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeFlowDestination,
    'line-opacity',
    destinationFlow['line-opacity'],
  );
  setPaintIfLayerExists(
    map,
    HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeFlowRiverMist,
    'line-dasharray',
    riverMist['line-dasharray'],
  );
  setPaintIfLayerExists(
    map,
    HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeFlowRiverMist,
    'line-opacity',
    riverMist['line-opacity'],
  );
}

const ROUTE_MARKER_LAYER_IDS_BY_KIND: Record<
  RouteMarkerKind,
  { pulse: string; core: string }
> = {
  origin: {
    pulse: HYDROWAY_MVP_OVERLAY_LAYER_IDS.routePointPulseOrigin,
    core: HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeMarkerCoreOrigin,
  },
  destination: {
    pulse: HYDROWAY_MVP_OVERLAY_LAYER_IDS.routePointPulseDestination,
    core: HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeMarkerCoreDestination,
  },
  vessel: {
    pulse: HYDROWAY_MVP_OVERLAY_LAYER_IDS.routePointPulseVessel,
    core: HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeMarkerCoreVessel,
  },
};

export function syncRouteMarkerLayerVisibility(
  map: Map | null | undefined,
  _visibleKinds?: ReadonlySet<RouteMarkerKind>,
): void {
  if (!isMapLibreOverlayMapUsable(map) || !map.loaded()) return;

  // HTML identification markers replace canvas dots; keep geometry sources intact.
  for (const kind of ['origin', 'destination', 'vessel'] as const) {
    const layerIds = ROUTE_MARKER_LAYER_IDS_BY_KIND[kind];
    setLayoutIfLayerExists(map, layerIds.pulse, 'visibility', 'none');
    setLayoutIfLayerExists(map, layerIds.core, 'visibility', 'none');
  }
}

export function syncRoutePointPulsePaint(
  map: Map | null | undefined,
  elapsedMs: number,
): void {
  if (!isMapLibreOverlayMapUsable(map) || !map.loaded()) return;

  const zoom = map.getZoom();
  if (!Number.isFinite(zoom)) return;

  const kinds: RoutePointPulseKind[] = ['origin', 'destination', 'vessel'];

  for (const kind of kinds) {
    const layerId = ROUTE_POINT_PULSE_LAYER_BY_KIND[kind];
    if (!layerExistsOnMap(map, layerId)) continue;

    const pulse = resolveRoutePointPulsePaint(kind, zoom, elapsedMs);
    setPaintIfLayerExists(map, layerId, 'circle-radius', pulse['circle-radius']);
    setPaintIfLayerExists(map, layerId, 'circle-opacity', pulse['circle-opacity']);
    setPaintIfLayerExists(map, layerId, 'circle-blur', pulse['circle-blur']);
    setPaintIfLayerExists(map, layerId, 'circle-stroke-opacity', pulse['circle-stroke-opacity']);
  }
}

export function extractOverlayRouteTrackCoordinates(geo: HydrowayGeoJsonSources): GeoJSON.Position[] {
  return resolveEffectiveRouteTrack(geo);
}

function isValidLngLat(coordinates: GeoJSON.Position | undefined): coordinates is GeoJSON.Position {
  if (!coordinates || coordinates.length < 2) return false;
  const [lng, lat] = coordinates;
  return Number.isFinite(lng) && Number.isFinite(lat);
}

/** Coordenada da embarcação — interpolada sobre a LineString da rota desenhada. */
export function extractCurrentVesselCoordinate(
  geo: HydrowayGeoJsonSources,
  progress01: number,
  routeTrackCoords: GeoJSON.Position[] = [],
): GeoJSON.Position | null {
  const track = resolveEffectiveRouteTrack(geo, routeTrackCoords);
  if (track.length < 2) return null;
  return getCoordinateAtRouteProgress(track, clampProgress01(progress01));
}

/** Coordenada de origem — primeiro vértice da LineString da rota desenhada. */
export function extractOriginCoordinate(
  geo: HydrowayGeoJsonSources,
  routeTrackCoords: GeoJSON.Position[] = [],
): GeoJSON.Position | null {
  const track = resolveEffectiveRouteTrack(geo, routeTrackCoords);
  return getRouteOriginCoordinate(track);
}

/** Coordenada de destino — último vértice da LineString da rota desenhada. */
export function extractDestinationCoordinate(
  geo: HydrowayGeoJsonSources,
  routeTrackCoords: GeoJSON.Position[] = [],
): GeoJSON.Position | null {
  const track = resolveEffectiveRouteTrack(geo, routeTrackCoords);
  return getRouteDestinationCoordinate(track);
}

export {
  resolveRouteMarkerCoordinates,
  getCoordinateAtRouteProgress,
  resolveEffectiveRouteTrack,
  sanitizeRouteTrackCoordinates,
};
