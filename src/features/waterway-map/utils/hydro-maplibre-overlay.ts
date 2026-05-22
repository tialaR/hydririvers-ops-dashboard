import type {
  ExpressionSpecification,
  GeoJSONSource,
  LayerSpecification,
  Map,
  SourceSpecification,
} from 'maplibre-gl';

import { HYDROWAY_GEOJSON_SOURCE_IDS } from '../data/hydroway-geo-source-ids';
import type { HydrowayGeoJsonSources } from '../domain/hydroway-map-model.types';
import { HYDRAWAY_MAP_CONTEXT_MOCK } from '../mocks/hydroway-map-context.mock';
import {
  pointAtPolylineProgress,
  slicePolylineAtProgress,
} from '../adapters/route-geometry';
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
  buildHydrowayRouteActiveGradientExpression,
  buildHydrowayRouteRemainingGradientExpression,
  HYDRAWAY_ROUTE_ACTIVE_COLORS,
  HYDRAWAY_ROUTE_BREATHING_ACTIVE_CYCLE_MS,
  HYDRAWAY_ROUTE_BREATHING_REMAINING_CYCLE_MS,
  HYDRAWAY_ROUTE_BREATHING_TICK_MS,
  HYDRAWAY_ROUTE_LINE_GRADIENT_ENABLED,
  HYDRAWAY_ROUTE_REMAINING_COLORS,
  resolveHydrowayRouteBreathingPaint,
  resolveRoutePointPulsePaint,
  ROUTE_RIVER_COLORS,
  type RoutePointPulseKind,
} from './hydro-maplibre-route-style';

/** @deprecated Prefer `HYDRI_CARGO_BOAT_MARKER_SVG_URL` from `hydro-cargo-boat-marker`. */
export const HYDRI_CURRENT_CARGO_BOAT_MARKER_SVG_URL = HYDRI_CARGO_BOAT_MARKER_SVG_URL;

export const HYDROWAY_ROUTE_MARKERS_SOURCE_ID = 'hydroway-route-markers';

export const HYDROWAY_MVP_OVERLAY_SOURCE_IDS = {
  routePoints: 'hydroway-route-points',
  routeFlowActive: 'hydroway-route-flow-active',
  routeFlowRemainingSegment: 'hydroway-route-flow-remaining',
  routeMarkers: HYDROWAY_ROUTE_MARKERS_SOURCE_ID,
} as const;

/** Layers MVP V2.7c — overlay limpo sobre basemap OpenFreeMap (dev only). */
/** Sources mock de contexto hidroviário (dev spike). */
export const HYDROWAY_CONTEXT_SOURCE_IDS = {
  corridors: 'hydri-waterway-corridors-source',
  corridorInfoPoints: 'hydri-waterway-corridor-info-points-source',
  terminals: 'hydri-waterway-terminals-source',
  infrastructure: 'hydri-waterway-infrastructure-source',
  signals: 'hydri-waterway-signals-source',
  basins: 'hydri-waterway-basins-source',
  basinInfoPoints: 'hydri-waterway-basin-info-points-source',
  alertZones: 'hydri-waterway-alert-zones-source',
  alertPoints: 'hydri-waterway-alert-points-source',
} as const;

export const HYDROWAY_CONTEXT_LAYER_IDS = {
  corridorsShadow: 'hydri-waterway-corridors-shadow',
  corridorsCore: 'hydri-waterway-corridors-core',
  corridorsHighlight: 'hydri-waterway-corridors-highlight',
  corridorInfoPoint: 'hydri-waterway-corridor-info-points',
  terminalsHalo: 'hydri-waterway-terminals-halo',
  terminalsPoint: 'hydri-waterway-terminals-point',
  infrastructurePoint: 'hydri-waterway-infrastructure-point',
  infrastructureLabel: 'hydri-waterway-infrastructure-label',
  signalsPoint: 'hydri-waterway-signals-point',
  basinsFill: 'hydri-waterway-basins-fill',
  basinsOutline: 'hydri-waterway-basins-outline',
  basinInfoPoint: 'hydri-waterway-basin-info-points',
  alertZonesFill: 'hydri-waterway-alert-zones-fill',
  alertZonesOutline: 'hydri-waterway-alert-zones-outline',
  alertPointsPoint: 'hydri-waterway-alert-points',
} as const;

export const HYDROWAY_MVP_OVERLAY_LAYER_IDS = {
  waterwayMain: 'hydri-waterway-main',
  waterwayCorridor: 'hydri-waterway-corridor',
  routeTrackCasing: 'hydri-route-track-casing',
  routeTrackGlow: 'hydri-route-track-glow',
  routeTrackCore: 'hydri-route-track-core',
  /** Remaining segment shadow (vessel → destination). */
  routeFlowRemaining: 'hydri-route-flow-remaining',
  /** Remaining segment glow. */
  routeFlowRiverMist: 'hydri-route-flow-river-mist',
  /** Remaining segment core. */
  routeFlowDestination: 'hydri-route-flow-destination',
  /** Active segment shadow (origin → vessel). */
  routeFlowActiveShadow: 'hydri-route-flow-active-shadow',
  /** Active segment glow. */
  routeFlowTraveledGlow: 'hydri-route-flow-traveled-glow',
  /** Active segment core. */
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
    HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeFlowActiveShadow,
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

const ROUTE_FLOW_ACTIVE_CORE_OPACITY = { default: 0.78, emphasis: 0.82 } as const;
const ROUTE_FLOW_REMAINING_CORE_OPACITY = { default: 0.24, emphasis: 0.28 } as const;

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

/** hr-route-base / glow — larguras de referência no zoom 8. */
const ROUTE_BASE_WIDTH = zoomWidth(3.2, 4.8, 6.2);
const ROUTE_GLOW_WIDTH = zoomWidth(5.5, 8.5, 11);
const ROUTE_ACTIVE_CORE_WIDTH = 6;
const ROUTE_ACTIVE_GLOW_WIDTH = 10;
const ROUTE_ACTIVE_SHADOW_WIDTH = 11;
const ROUTE_REMAINING_CORE_WIDTH = 5;
const ROUTE_REMAINING_GLOW_WIDTH = 7;
const ROUTE_REMAINING_SHADOW_WIDTH = 9;

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

function lineStringFeatureCollection(coordinates: GeoJSON.Position[]): GeoJSON.FeatureCollection {
  if (coordinates.length < 2) {
    return emptyCollection();
  }

  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { kind: 'route-segment' },
        geometry: {
          type: 'LineString',
          coordinates,
        },
      },
    ],
  };
}

function slicePolylineFromProgress(
  coordinates: GeoJSON.Position[],
  progress01: number,
): GeoJSON.Position[] {
  if (coordinates.length < 2) {
    return coordinates;
  }

  const safeProgress = clampProgress01(progress01);
  if (safeProgress <= 0) {
    return coordinates;
  }
  if (safeProgress >= 1) {
    const end = coordinates[coordinates.length - 1];
    return [end, end];
  }

  const start = pointAtPolylineProgress(coordinates, safeProgress);
  const traveled = slicePolylineAtProgress(coordinates, safeProgress);
  const seam = traveled[traveled.length - 1];
  const remaining: GeoJSON.Position[] = [start];

  let seamIndex = -1;
  for (let index = 0; index < coordinates.length; index += 1) {
    const [lng, lat] = coordinates[index];
    if (Math.abs(lng - seam[0]) < 1e-5 && Math.abs(lat - seam[1]) < 1e-5) {
      seamIndex = index;
      break;
    }
  }

  if (seamIndex >= 0) {
    for (let index = seamIndex + 1; index < coordinates.length; index += 1) {
      remaining.push(coordinates[index]);
    }
  } else {
    remaining.push(seam);
    const end = coordinates[coordinates.length - 1];
    if (remaining[remaining.length - 1] !== end) {
      remaining.push(end);
    }
  }

  if (remaining.length < 2) {
    remaining.push(coordinates[coordinates.length - 1]);
  }

  return remaining;
}

export function buildRouteActiveSegmentGeoJson(
  routeTrack: GeoJSON.Position[],
  progress01: number,
): GeoJSON.FeatureCollection {
  return lineStringFeatureCollection(slicePolylineAtProgress(routeTrack, clampProgress01(progress01)));
}

export function buildRouteRemainingSegmentGeoJson(
  routeTrack: GeoJSON.Position[],
  progress01: number,
): GeoJSON.FeatureCollection {
  return lineStringFeatureCollection(slicePolylineFromProgress(routeTrack, clampProgress01(progress01)));
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

export function getHydrowayContextLayerDefinitions(): LayerSpecification[] {
  const corridorWidth = zoomWidth(1.8, 3.2, 4.8);
  const corridorHighlightWidth = zoomWidth(2.4, 4, 5.5);

  return [
    {
      id: HYDROWAY_CONTEXT_LAYER_IDS.basinsFill,
      type: 'fill',
      source: HYDROWAY_CONTEXT_SOURCE_IDS.basins,
      paint: {
        'fill-color': 'rgba(32, 72, 96, 0.12)',
        'fill-opacity': 0.12,
      },
    },
    {
      id: HYDROWAY_CONTEXT_LAYER_IDS.alertZonesFill,
      type: 'fill',
      source: HYDROWAY_CONTEXT_SOURCE_IDS.alertZones,
      paint: {
        'fill-color': [
          'match',
          ['get', 'severity'],
          'high',
          'rgba(196, 92, 72, 0.22)',
          'medium',
          'rgba(196, 148, 72, 0.18)',
          'rgba(120, 148, 168, 0.14)',
        ],
        'fill-opacity': 0.28,
      },
    },
    {
      id: HYDROWAY_CONTEXT_LAYER_IDS.alertZonesOutline,
      type: 'line',
      source: HYDROWAY_CONTEXT_SOURCE_IDS.alertZones,
      paint: {
        'line-color': 'rgba(196, 120, 88, 0.55)',
        'line-width': 1.2,
        'line-opacity': 0.45,
        'line-dasharray': [4, 3],
      },
    },
    {
      id: HYDROWAY_CONTEXT_LAYER_IDS.corridorsShadow,
      type: 'line',
      source: HYDROWAY_CONTEXT_SOURCE_IDS.corridors,
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': 'rgba(8, 24, 36, 0.65)',
        'line-width': zoomWidth(3, 5, 7),
        'line-opacity': 0.35,
        'line-blur': 0.8,
      },
    },
    {
      id: HYDROWAY_CONTEXT_LAYER_IDS.corridorsCore,
      type: 'line',
      source: HYDROWAY_CONTEXT_SOURCE_IDS.corridors,
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': [
          'match',
          ['get', 'category'],
          'main',
          'rgba(48, 168, 188, 0.88)',
          'strategic',
          'rgba(58, 148, 198, 0.82)',
          'rgba(72, 158, 178, 0.72)',
        ],
        'line-width': corridorWidth,
        'line-opacity': 0.82,
      },
    },
    {
      id: HYDROWAY_CONTEXT_LAYER_IDS.corridorsHighlight,
      type: 'line',
      source: HYDROWAY_CONTEXT_SOURCE_IDS.corridors,
      filter: ['==', ['get', 'category'], 'strategic'],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': 'rgba(95, 220, 235, 0.75)',
        'line-width': corridorHighlightWidth,
        'line-opacity': 0.55,
        'line-blur': 0.4,
      },
    },
    {
      id: HYDROWAY_CONTEXT_LAYER_IDS.corridorInfoPoint,
      type: 'circle',
      source: HYDROWAY_CONTEXT_SOURCE_IDS.corridorInfoPoints,
      paint: {
        'circle-color': 'rgba(13, 172, 160, 0.82)',
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          4,
          2.2,
          10,
          3.2,
          14,
          4,
        ],
        'circle-stroke-color': 'rgba(127, 255, 242, 0.35)',
        'circle-stroke-width': 0.8,
        'circle-opacity': 0.72,
      },
    },
    {
      id: HYDROWAY_CONTEXT_LAYER_IDS.terminalsHalo,
      type: 'circle',
      source: HYDROWAY_CONTEXT_SOURCE_IDS.terminals,
      paint: {
        'circle-color': 'rgba(72, 210, 228, 0.18)',
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          4,
          6,
          10,
          10,
          14,
          14,
        ],
        'circle-opacity': 0.5,
        'circle-blur': 0.65,
      },
    },
    {
      id: HYDROWAY_CONTEXT_LAYER_IDS.terminalsPoint,
      type: 'circle',
      source: HYDROWAY_CONTEXT_SOURCE_IDS.terminals,
      paint: {
        'circle-color': [
          'match',
          ['get', 'importance'],
          'national',
          '#5fd4e8',
          'regional',
          '#4ab8cc',
          '#3a9aad',
        ],
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          4,
          3.5,
          10,
          5.5,
          14,
          7,
        ],
        'circle-stroke-color': 'rgba(6, 18, 28, 0.85)',
        'circle-stroke-width': 1.5,
        'circle-opacity': 0.88,
      },
    },
    {
      id: HYDROWAY_CONTEXT_LAYER_IDS.infrastructurePoint,
      type: 'circle',
      source: HYDROWAY_CONTEXT_SOURCE_IDS.infrastructure,
      paint: {
        'circle-color': [
          'match',
          ['get', 'assetType'],
          'dam',
          '#c48a5a',
          'lock',
          '#b89a4a',
          'draft-restriction',
          '#c47258',
          'navigation-risk',
          '#a87888',
          '#8a9aaf',
        ],
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          4,
          4,
          10,
          6,
          14,
          8,
        ],
        'circle-stroke-color': 'rgba(6, 18, 28, 0.9)',
        'circle-stroke-width': 1.2,
        'circle-opacity': 0.9,
      },
    },
    {
      id: HYDROWAY_CONTEXT_LAYER_IDS.infrastructureLabel,
      type: 'symbol',
      source: HYDROWAY_CONTEXT_SOURCE_IDS.infrastructure,
      layout: {
        'text-field': ['get', 'name'],
        'text-size': 10,
        'text-offset': [0, 1.2],
        'text-anchor': 'top',
        visibility: 'none',
      },
      paint: {
        'text-color': 'rgba(58, 88, 108, 0.85)',
        'text-halo-color': 'rgba(230, 234, 238, 0.75)',
        'text-halo-width': 1,
        'text-opacity': 0.85,
      },
    },
    {
      id: HYDROWAY_CONTEXT_LAYER_IDS.signalsPoint,
      type: 'circle',
      source: HYDROWAY_CONTEXT_SOURCE_IDS.signals,
      paint: {
        'circle-color': [
          'match',
          ['get', 'condition'],
          'maintenance',
          '#c4a85a',
          'attention',
          '#d4a858',
          '#6ad4c8',
        ],
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          4,
          2.5,
          10,
          4,
          14,
          5,
        ],
        'circle-stroke-color': 'rgba(6, 18, 28, 0.8)',
        'circle-stroke-width': 1,
        'circle-opacity': 0.85,
      },
    },
    {
      id: HYDROWAY_CONTEXT_LAYER_IDS.basinsOutline,
      type: 'line',
      source: HYDROWAY_CONTEXT_SOURCE_IDS.basins,
      paint: {
        'line-color': 'rgba(58, 108, 138, 0.45)',
        'line-width': 1,
        'line-opacity': 0.35,
        'line-dasharray': [6, 4],
      },
    },
    {
      id: HYDROWAY_CONTEXT_LAYER_IDS.basinInfoPoint,
      type: 'circle',
      source: HYDROWAY_CONTEXT_SOURCE_IDS.basinInfoPoints,
      paint: {
        'circle-color': 'rgba(13, 172, 160, 0.55)',
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          4,
          2,
          10,
          2.8,
          14,
          3.5,
        ],
        'circle-stroke-color': 'rgba(127, 255, 242, 0.28)',
        'circle-stroke-width': 0.6,
        'circle-opacity': 0.62,
      },
    },
    {
      id: HYDROWAY_CONTEXT_LAYER_IDS.alertPointsPoint,
      type: 'circle',
      source: HYDROWAY_CONTEXT_SOURCE_IDS.alertPoints,
      paint: {
        'circle-color': [
          'match',
          ['get', 'severity'],
          'high',
          'rgba(196, 92, 72, 0.82)',
          'medium',
          'rgba(196, 148, 72, 0.78)',
          'rgba(120, 148, 168, 0.7)',
        ],
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          4,
          2.2,
          10,
          3,
          14,
          3.8,
        ],
        'circle-stroke-color': 'rgba(8, 18, 28, 0.75)',
        'circle-stroke-width': 0.8,
        'circle-opacity': 0.8,
      },
    },
  ];
}

export function installHydrowayContextOverlay(map: Map): void {
  const contextSources: Record<string, SourceSpecification> = {
    [HYDROWAY_CONTEXT_SOURCE_IDS.corridors]: geoJsonSource(HYDRAWAY_MAP_CONTEXT_MOCK.corridors),
    [HYDROWAY_CONTEXT_SOURCE_IDS.corridorInfoPoints]: geoJsonSource(
      HYDRAWAY_MAP_CONTEXT_MOCK.corridorInfoPoints,
    ),
    [HYDROWAY_CONTEXT_SOURCE_IDS.terminals]: geoJsonSource(HYDRAWAY_MAP_CONTEXT_MOCK.terminals),
    [HYDROWAY_CONTEXT_SOURCE_IDS.infrastructure]: geoJsonSource(
      HYDRAWAY_MAP_CONTEXT_MOCK.infrastructure,
    ),
    [HYDROWAY_CONTEXT_SOURCE_IDS.signals]: geoJsonSource(HYDRAWAY_MAP_CONTEXT_MOCK.signals),
    [HYDROWAY_CONTEXT_SOURCE_IDS.basins]: geoJsonSource(HYDRAWAY_MAP_CONTEXT_MOCK.basins),
    [HYDROWAY_CONTEXT_SOURCE_IDS.basinInfoPoints]: geoJsonSource(
      HYDRAWAY_MAP_CONTEXT_MOCK.basinInfoPoints,
    ),
    [HYDROWAY_CONTEXT_SOURCE_IDS.alertZones]: geoJsonSource(
      HYDRAWAY_MAP_CONTEXT_MOCK.alertZones,
    ),
    [HYDROWAY_CONTEXT_SOURCE_IDS.alertPoints]: geoJsonSource(
      HYDRAWAY_MAP_CONTEXT_MOCK.alertPoints,
    ),
  };

  for (const [id, spec] of Object.entries(contextSources)) {
    if (!map.getSource(id)) {
      map.addSource(id, spec);
    }
  }

  for (const layer of getHydrowayContextLayerDefinitions()) {
    if (!layerExistsOnMap(map, layer.id)) {
      map.addLayer(layer);
    }
  }
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
      source: HYDROWAY_MVP_OVERLAY_SOURCE_IDS.routeFlowRemainingSegment,
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': HYDRAWAY_ROUTE_REMAINING_COLORS.shadow,
        'line-width': ROUTE_REMAINING_SHADOW_WIDTH,
        'line-opacity': 0.16,
        'line-blur': 0.7,
      },
    },
    {
      id: HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeFlowRiverMist,
      type: 'line',
      source: HYDROWAY_MVP_OVERLAY_SOURCE_IDS.routeFlowRemainingSegment,
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': HYDRAWAY_ROUTE_REMAINING_COLORS.glow,
        'line-width': ROUTE_REMAINING_GLOW_WIDTH,
        'line-opacity': 0.055,
        'line-blur': 2.8,
      },
    },
    {
      id: HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeFlowDestination,
      type: 'line',
      source: HYDROWAY_MVP_OVERLAY_SOURCE_IDS.routeFlowRemainingSegment,
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        ...(HYDRAWAY_ROUTE_LINE_GRADIENT_ENABLED
          ? { 'line-gradient': buildHydrowayRouteRemainingGradientExpression() }
          : { 'line-color': HYDRAWAY_ROUTE_REMAINING_COLORS.fallback }),
        'line-width': ROUTE_REMAINING_CORE_WIDTH,
        'line-opacity': ROUTE_FLOW_REMAINING_CORE_OPACITY.default,
        'line-blur': 0.45,
      },
    },
    {
      id: HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeFlowActiveShadow,
      type: 'line',
      source: HYDROWAY_MVP_OVERLAY_SOURCE_IDS.routeFlowActive,
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': HYDRAWAY_ROUTE_ACTIVE_COLORS.shadow,
        'line-width': ROUTE_ACTIVE_SHADOW_WIDTH,
        'line-opacity': 0.37,
        'line-blur': 0.7,
      },
    },
    {
      id: HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeFlowTraveledGlow,
      type: 'line',
      source: HYDROWAY_MVP_OVERLAY_SOURCE_IDS.routeFlowActive,
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': HYDRAWAY_ROUTE_ACTIVE_COLORS.glow,
        'line-width': ROUTE_ACTIVE_GLOW_WIDTH,
        'line-opacity': 0.1,
        'line-blur': 2.2,
      },
    },
    {
      id: HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeFlowTraveled,
      type: 'line',
      source: HYDROWAY_MVP_OVERLAY_SOURCE_IDS.routeFlowActive,
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        ...(HYDRAWAY_ROUTE_LINE_GRADIENT_ENABLED
          ? { 'line-gradient': buildHydrowayRouteActiveGradientExpression() }
          : { 'line-color': HYDRAWAY_ROUTE_ACTIVE_COLORS.bright }),
        'line-width': ROUTE_ACTIVE_CORE_WIDTH,
        'line-opacity': ROUTE_FLOW_ACTIVE_CORE_OPACITY.default,
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
  installHydrowayContextOverlay(map);

  const sources: Record<string, SourceSpecification> = {
    [HYDROWAY_GEOJSON_SOURCE_IDS.mainRivers]: geoJsonSource(geo.mainRivers),
    [HYDROWAY_GEOJSON_SOURCE_IDS.navigableCorridors]: geoJsonSource(geo.navigableCorridors),
    [HYDROWAY_GEOJSON_SOURCE_IDS.routeTrack]: geoJsonSource(geo.routeTrack),
    [HYDROWAY_GEOJSON_SOURCE_IDS.routeTraveled]: geoJsonSource(geo.routeTraveled),
    [HYDROWAY_MVP_OVERLAY_SOURCE_IDS.routeFlowActive]: geoJsonSourceWithLineMetrics(emptyCollection()),
    [HYDROWAY_MVP_OVERLAY_SOURCE_IDS.routeFlowRemainingSegment]: geoJsonSourceWithLineMetrics(
      emptyCollection(),
    ),
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
  /** LineStrings ativa/restante derivadas da mesma rota ciano (routeTrack). */
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
    setSource(
      HYDROWAY_MVP_OVERLAY_SOURCE_IDS.routeFlowActive,
      buildRouteActiveSegmentGeoJson(renderedRouteCoordinates, safeProgress),
    );
    setSource(
      HYDROWAY_MVP_OVERLAY_SOURCE_IDS.routeFlowRemainingSegment,
      buildRouteRemainingSegmentGeoJson(renderedRouteCoordinates, safeProgress),
    );
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
    setSource(HYDROWAY_MVP_OVERLAY_SOURCE_IDS.routeFlowActive, emptyCollection());
    setSource(HYDROWAY_MVP_OVERLAY_SOURCE_IDS.routeFlowRemainingSegment, emptyCollection());
    setSource(HYDROWAY_GEOJSON_SOURCE_IDS.routeTraveled, geo.routeTraveled);
    setSource(HYDROWAY_MVP_OVERLAY_SOURCE_IDS.routeMarkers, emptyCollection());
    setSource(HYDROWAY_MVP_OVERLAY_SOURCE_IDS.routePoints, emptyCollection());
  }

  syncRouteFlowPaint(map, safeProgress);

  return { renderedRouteCoordinates };
}

export function syncRouteFlowPaint(
  map: Map | null | undefined,
  _progress01: number,
  options?: {
    hydrographyEmphasis?: boolean;
  },
): void {
  if (!isMapLibreOverlayMapUsable(map) || !map.loaded()) return;

  const emphasis = options?.hydrographyEmphasis ?? false;
  const activeCoreOpacity = emphasis
    ? ROUTE_FLOW_ACTIVE_CORE_OPACITY.emphasis
    : ROUTE_FLOW_ACTIVE_CORE_OPACITY.default;
  const remainingCoreOpacity = emphasis
    ? ROUTE_FLOW_REMAINING_CORE_OPACITY.emphasis
    : ROUTE_FLOW_REMAINING_CORE_OPACITY.default;

  if (HYDRAWAY_ROUTE_LINE_GRADIENT_ENABLED) {
    setPaintIfLayerExists(
      map,
      HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeFlowTraveled,
      'line-gradient',
      buildHydrowayRouteActiveGradientExpression(),
    );
    setPaintIfLayerExists(
      map,
      HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeFlowDestination,
      'line-gradient',
      buildHydrowayRouteRemainingGradientExpression(),
    );
  }

  setPaintIfLayerExists(
    map,
    HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeFlowTraveled,
    'line-opacity',
    activeCoreOpacity,
  );
  setPaintIfLayerExists(
    map,
    HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeFlowDestination,
    'line-opacity',
    remainingCoreOpacity,
  );
}

const HYDRAWAY_ROUTE_BREATHING_LAYER_TARGETS = {
  activeGlow: HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeFlowTraveledGlow,
  activeCore: HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeFlowTraveled,
  remainingGlow: HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeFlowRiverMist,
  remainingCore: HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeFlowDestination,
} as const;

let hydrowayRouteBreathingStartMs = 0;
let hydrowayRouteBreathingEnabled = false;
let hydrowayRouteBreathingDebugLogged = false;

export function syncHydrowayRouteBreathingPaint(map: Map, timestamp: number): void {
  if (!isMapLibreOverlayMapUsable(map) || !map.loaded()) return;

  const elapsed = Math.max(0, timestamp - hydrowayRouteBreathingStartMs);
  const paint = resolveHydrowayRouteBreathingPaint(elapsed);

  setPaintIfLayerExists(
    map,
    HYDRAWAY_ROUTE_BREATHING_LAYER_TARGETS.activeGlow,
    'line-opacity',
    paint.active.glowOpacity,
  );
  setPaintIfLayerExists(
    map,
    HYDRAWAY_ROUTE_BREATHING_LAYER_TARGETS.activeGlow,
    'line-blur',
    paint.active.glowBlur,
  );
  setPaintIfLayerExists(
    map,
    HYDRAWAY_ROUTE_BREATHING_LAYER_TARGETS.activeCore,
    'line-opacity',
    paint.active.coreOpacity,
  );
  setPaintIfLayerExists(
    map,
    HYDRAWAY_ROUTE_BREATHING_LAYER_TARGETS.remainingGlow,
    'line-opacity',
    paint.remaining.glowOpacity,
  );
  setPaintIfLayerExists(
    map,
    HYDRAWAY_ROUTE_BREATHING_LAYER_TARGETS.remainingGlow,
    'line-blur',
    paint.remaining.glowBlur,
  );
  setPaintIfLayerExists(
    map,
    HYDRAWAY_ROUTE_BREATHING_LAYER_TARGETS.remainingCore,
    'line-opacity',
    paint.remaining.coreOpacity,
  );
}

export function isHydrowayRouteBreathingAnimationEnabled(): boolean {
  return hydrowayRouteBreathingEnabled;
}

export function startHydrowayRouteBreathingAnimation(
  map: Map,
  options?: { reducedMotion?: boolean },
): void {
  if (!isMapLibreOverlayMapUsable(map)) return;
  if (options?.reducedMotion) return;

  hydrowayRouteBreathingEnabled = true;
  if (hydrowayRouteBreathingStartMs === 0) {
    hydrowayRouteBreathingStartMs = performance.now();
  }

  if (process.env.NODE_ENV === 'development' && !hydrowayRouteBreathingDebugLogged) {
    hydrowayRouteBreathingDebugLogged = true;
    console.debug('[hydroway-map] hydroway route breathing animation active', {
      activeBreathingStarted: layerExistsOnMap(map, HYDRAWAY_ROUTE_BREATHING_LAYER_TARGETS.activeCore),
      remainingBreathingStarted: layerExistsOnMap(
        map,
        HYDRAWAY_ROUTE_BREATHING_LAYER_TARGETS.remainingCore,
      ),
      activeCycleMs: HYDRAWAY_ROUTE_BREATHING_ACTIVE_CYCLE_MS,
      remainingCycleMs: HYDRAWAY_ROUTE_BREATHING_REMAINING_CYCLE_MS,
      lineGradientEnabled: HYDRAWAY_ROUTE_LINE_GRADIENT_ENABLED,
      reducedMotion: Boolean(options?.reducedMotion),
    });
  }
}

export function stopHydrowayRouteBreathingAnimation(): void {
  hydrowayRouteBreathingEnabled = false;
  hydrowayRouteBreathingStartMs = 0;
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

/** Apenas pontos informativos — sem fill/linha ampla (dev spike). */
export const HYDRAWAY_LAYER_TOOLTIP_LAYER_IDS = [
  HYDROWAY_CONTEXT_LAYER_IDS.terminalsPoint,
  HYDROWAY_CONTEXT_LAYER_IDS.infrastructurePoint,
  HYDROWAY_CONTEXT_LAYER_IDS.signalsPoint,
  HYDROWAY_CONTEXT_LAYER_IDS.corridorInfoPoint,
  HYDROWAY_CONTEXT_LAYER_IDS.basinInfoPoint,
  HYDROWAY_CONTEXT_LAYER_IDS.alertPointsPoint,
] as const;

export type HydrowayLayerTooltipCategory =
  | 'corridor'
  | 'terminal'
  | 'infrastructure'
  | 'signal'
  | 'basin'
  | 'alert';

const TOOLTIP_CATEGORY_BY_LAYER: Record<string, HydrowayLayerTooltipCategory> = {
  [HYDROWAY_CONTEXT_LAYER_IDS.terminalsPoint]: 'terminal',
  [HYDROWAY_CONTEXT_LAYER_IDS.infrastructurePoint]: 'infrastructure',
  [HYDROWAY_CONTEXT_LAYER_IDS.signalsPoint]: 'signal',
  [HYDROWAY_CONTEXT_LAYER_IDS.corridorInfoPoint]: 'corridor',
  [HYDROWAY_CONTEXT_LAYER_IDS.basinInfoPoint]: 'basin',
  [HYDROWAY_CONTEXT_LAYER_IDS.alertPointsPoint]: 'alert',
};

const TOOLTIP_EYEBROW_BY_CATEGORY: Record<HydrowayLayerTooltipCategory, string> = {
  corridor: 'Corredor',
  terminal: 'Terminal',
  infrastructure: 'Infra',
  signal: 'Sinal',
  basin: 'Bacia',
  alert: 'Alerta',
};

const TOOLTIP_TITLE_MAX_LEN = 28;
const TOOLTIP_META_MAX_LEN = 36;

export function truncateHydrowayMapTooltipText(value: string, maxLen: number): string {
  const trimmed = value.trim();
  if (trimmed.length <= maxLen) return trimmed;
  return `${trimmed.slice(0, Math.max(0, maxLen - 1))}…`;
}

export function escapeHydrowayMapTooltipText(value: unknown): string {
  const text = value === null || value === undefined ? '' : String(value);
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function resolveHydrowayLayerTooltipCategory(
  layerId: string,
): HydrowayLayerTooltipCategory | null {
  return TOOLTIP_CATEGORY_BY_LAYER[layerId] ?? null;
}

export function canShowHydrowayLayerTooltip(layerId: string): boolean {
  return resolveHydrowayLayerTooltipCategory(layerId) !== null;
}

function readFeatureProperty(feature: GeoJSON.Feature, key: string): unknown {
  const props = feature.properties;
  if (!props || typeof props !== 'object') return undefined;
  return (props as Record<string, unknown>)[key];
}

function readFeatureString(feature: GeoJSON.Feature, key: string, fallback = ''): string {
  const value = readFeatureProperty(feature, key);
  if (value === null || value === undefined) return fallback;
  return String(value).trim();
}

function resolveTooltipCategoryFromFeature(
  layerId: string,
  feature: GeoJSON.Feature,
): HydrowayLayerTooltipCategory | null {
  const kind = readFeatureString(feature, 'tooltipKind');
  if (
    kind === 'corridor' ||
    kind === 'terminal' ||
    kind === 'infrastructure' ||
    kind === 'signal' ||
    kind === 'basin' ||
    kind === 'alert'
  ) {
    return kind;
  }
  return resolveHydrowayLayerTooltipCategory(layerId);
}

function formatCargoProfileShort(value: string): string {
  switch (value) {
    case 'grains':
      return 'grãos';
    case 'fuel':
      return 'combustível';
    case 'ores':
      return 'minério';
    case 'containers':
      return 'contêineres';
    case 'bulk':
      return 'granel';
    default:
      return 'geral';
  }
}

function formatImportanceShort(value: string): string {
  switch (value) {
    case 'national':
      return 'nacional';
    case 'regional':
      return 'regional';
    case 'local':
      return 'local';
    default:
      return 'ativo';
  }
}

function formatCorridorMeta(feature: GeoJSON.Feature): string {
  const category = readFeatureString(feature, 'category');
  const navigability = readFeatureString(feature, 'navigability');
  const left =
    category === 'strategic'
      ? 'Estratégico'
      : category === 'main'
        ? 'Principal'
        : category === 'secondary'
          ? 'Secundário'
          : 'Corredor';
  const right =
    navigability === 'high'
      ? 'nav. alta'
      : navigability === 'medium'
        ? 'nav. média'
        : navigability === 'low'
          ? 'nav. baixa'
          : 'monitorado';
  return `${left} · ${right}`;
}

function formatTerminalMeta(feature: GeoJSON.Feature): string {
  const cargoProfile = readFeatureString(feature, 'cargoProfile');
  const importance = readFeatureString(feature, 'importance');
  return `Carga ${formatCargoProfileShort(cargoProfile)} · ${formatImportanceShort(importance)}`;
}

function formatInfrastructureMeta(feature: GeoJSON.Feature): string {
  const assetType = readFeatureString(feature, 'assetType');
  const severity = readFeatureString(feature, 'severity');
  const left =
    assetType === 'dam'
      ? 'Barragem'
      : assetType === 'draft-restriction'
        ? 'Calado'
        : assetType === 'navigation-risk'
          ? 'Risco nav.'
          : 'Infra';
  const right =
    severity === 'high' ? 'alta' : severity === 'medium' ? 'média' : 'monitorado';
  return `${left} · sev. ${right}`;
}

function formatSignalMeta(feature: GeoJSON.Feature): string {
  const condition = readFeatureString(feature, 'condition');
  const priority = readFeatureString(feature, 'visibilityPriority');
  const left =
    condition === 'maintenance'
      ? 'Manutenção'
      : condition === 'attention'
        ? 'Atenção'
        : 'Ativo';
  const right =
    priority === 'high' ? 'prio. alta' : priority === 'medium' ? 'prio. média' : 'referência';
  return `${left} · ${right}`;
}

function formatBasinMeta(feature: GeoJSON.Feature): string {
  const region = readFeatureString(feature, 'region');
  const sensitivity = readFeatureString(feature, 'environmentalSensitivity');
  const left = region ? region : 'Planejamento';
  const right =
    sensitivity === 'high' ? 'sens. alta' : sensitivity === 'medium' ? 'sens. média' : 'contexto';
  return `${left} · ${right}`;
}

function formatAlertMeta(feature: GeoJSON.Feature): string {
  const alertType = readFeatureString(feature, 'alertType');
  const severity = readFeatureString(feature, 'severity');
  const left =
    alertType === 'draft-restricted'
      ? 'Calado'
      : alertType === 'low-visibility'
        ? 'Visibilidade'
        : alertType === 'traffic-intense'
          ? 'Tráfego'
          : alertType === 'environmental-monitoring'
            ? 'Ambiental'
            : 'Operação';
  const right =
    severity === 'high' ? 'alta' : severity === 'medium' ? 'média' : 'baixa';
  return `${left} · sev. ${right}`;
}

export function resolveHydrowayLayerTooltipContent(
  layerId: string,
  feature: GeoJSON.Feature,
): { eyebrow: string; title: string; meta: string } | null {
  const category = resolveTooltipCategoryFromFeature(layerId, feature);
  if (!category) return null;

  const title = truncateHydrowayMapTooltipText(
    readFeatureString(feature, 'name') ||
      readFeatureString(feature, 'basinName') ||
      'Ponto hidroviário',
    TOOLTIP_TITLE_MAX_LEN,
  );

  const metaByCategory: Record<HydrowayLayerTooltipCategory, string> = {
    corridor: formatCorridorMeta(feature),
    terminal: formatTerminalMeta(feature),
    infrastructure: formatInfrastructureMeta(feature),
    signal: formatSignalMeta(feature),
    basin: formatBasinMeta(feature),
    alert: formatAlertMeta(feature),
  };

  return {
    eyebrow: TOOLTIP_EYEBROW_BY_CATEGORY[category],
    title,
    meta: truncateHydrowayMapTooltipText(metaByCategory[category], TOOLTIP_META_MAX_LEN),
  };
}

export function getHydrowayLayerTooltipFeatureKey(
  layerId: string,
  feature: GeoJSON.Feature,
): string | null {
  if (!resolveTooltipCategoryFromFeature(layerId, feature)) return null;

  const geometry = feature.geometry;
  if (geometry?.type !== 'Point') return null;

  const featureId = readFeatureString(feature, 'id');
  if (featureId) return `${layerId}:${featureId}`;

  if (geometry.coordinates.length >= 2) {
    const [lng, lat] = geometry.coordinates;
    return `${layerId}:point:${lng.toFixed(5)}:${lat.toFixed(5)}`;
  }

  return null;
}

export function buildHydrowayLayerTooltipHtml(
  layerId: string,
  feature: GeoJSON.Feature,
): string | null {
  const content = resolveHydrowayLayerTooltipContent(layerId, feature);
  if (!content) return null;

  const eyebrow = escapeHydrowayMapTooltipText(content.eyebrow);
  const title = escapeHydrowayMapTooltipText(content.title);
  const meta = escapeHydrowayMapTooltipText(content.meta);

  return [
    '<div class="hydriMapTooltipCard">',
    `<span class="hydriMapTooltipEyebrow">${eyebrow}</span>`,
    `<strong class="hydriMapTooltipTitle">${title}</strong>`,
    `<span class="hydriMapTooltipMeta">${meta}</span>`,
    '</div>',
  ].join('');
}

export function isHydrowayLayerTooltipLayerVisible(map: Map, layerId: string): boolean {
  if (!layerExistsOnMap(map, layerId)) return false;

  try {
    const visibility = map.getLayoutProperty(layerId, 'visibility');
    if (visibility === 'none') return false;
  } catch {
    return false;
  }

  const opacityKeys = ['fill-opacity', 'line-opacity', 'circle-opacity'] as const;
  for (const property of opacityKeys) {
    try {
      const value = map.getPaintProperty(layerId, property);
      if (typeof value === 'number' && value <= 0.02) return false;
    } catch {
      // Layer may not expose this paint property.
    }
  }

  return true;
}

export function resolveHydrowayLayerTooltipLngLat(
  feature: GeoJSON.Feature,
  cursorLngLat: { lng: number; lat: number },
): [number, number] {
  const geometry = feature.geometry;
  if (geometry?.type === 'Point' && geometry.coordinates.length >= 2) {
    const [lng, lat] = geometry.coordinates;
    if (Number.isFinite(lng) && Number.isFinite(lat)) {
      const wrap = (value: number) => {
        const world = 360;
        return ((((value - cursorLngLat.lng) % world) + world) % world) + cursorLngLat.lng;
      };
      return [wrap(lng), lat];
    }
  }

  return [cursorLngLat.lng, cursorLngLat.lat];
}

export {
  resolveRouteMarkerCoordinates,
  getCoordinateAtRouteProgress,
  resolveEffectiveRouteTrack,
  sanitizeRouteTrackCoordinates,
};
