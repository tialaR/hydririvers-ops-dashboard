import type { HydrowayContextLayerVisibility } from '../types/hydroway-map-layer-preset.types';
import {
  HYDROWAY_CONTEXT_LAYER_IDS,
  HYDROWAY_MVP_OVERLAY_LAYER_IDS,
} from '../utils/hydro-maplibre-overlay';
import type { RouteFlowPalette } from '../utils/hydro-maplibre-route-style';

export type HydrowayMapLayerPresetId =
  | 'dark'
  | 'semiLight'
  | 'realistic'
  | 'waterways'
  | 'government';

export type MapPaintAdjustment = {
  layerId: string;
  property: string;
  value: unknown;
};

export type HydrowayMapLayerPresetConfig = {
  id: HydrowayMapLayerPresetId;
  labelKey: string;
  descriptionKey: string;
  basemapPaint: readonly MapPaintAdjustment[];
  routePaint: readonly MapPaintAdjustment[];
  waterwayPaint: readonly MapPaintAdjustment[];
  routeFlowPalette: RouteFlowPalette;
  contextLayers: HydrowayContextLayerVisibility;
  contextPaint?: readonly MapPaintAdjustment[];
  unavailableLayerHints?: readonly string[];
};

const DARK_CONTEXT: HydrowayContextLayerVisibility = {
  corridors: 0.88,
  corridorsHighlight: 0.14,
  terminals: 0.7,
  infrastructure: 0.66,
  signals: 0.58,
  basins: 0.03,
  basinsOutline: 0.08,
  alerts: 0.06,
  alertsOutline: 0.18,
  showInfrastructureLabels: false,
};

const DARK_CONTEXT_PAINT: MapPaintAdjustment[] = [
  {
    layerId: HYDROWAY_CONTEXT_LAYER_IDS.corridorsShadow,
    property: 'line-color',
    value: '#050808',
  },
  {
    layerId: HYDROWAY_CONTEXT_LAYER_IDS.corridorsShadow,
    property: 'line-opacity',
    value: 0.54,
  },
  {
    layerId: HYDROWAY_CONTEXT_LAYER_IDS.corridorsCore,
    property: 'line-color',
    value: '#0daca0',
  },
  {
    layerId: HYDROWAY_CONTEXT_LAYER_IDS.corridorsCore,
    property: 'line-opacity',
    value: 0.42,
  },
  {
    layerId: HYDROWAY_CONTEXT_LAYER_IDS.corridorsHighlight,
    property: 'line-color',
    value: '#7ffff2',
  },
  {
    layerId: HYDROWAY_CONTEXT_LAYER_IDS.corridorsHighlight,
    property: 'line-opacity',
    value: 0.12,
  },
  {
    layerId: HYDROWAY_CONTEXT_LAYER_IDS.corridorInfoPoint,
    property: 'circle-color',
    value: '#0daca0',
  },
  {
    layerId: HYDROWAY_CONTEXT_LAYER_IDS.corridorInfoPoint,
    property: 'circle-opacity',
    value: 0.62,
  },
  {
    layerId: HYDROWAY_CONTEXT_LAYER_IDS.terminalsHalo,
    property: 'circle-color',
    value: '#7ffff2',
  },
  {
    layerId: HYDROWAY_CONTEXT_LAYER_IDS.terminalsHalo,
    property: 'circle-opacity',
    value: 0.1,
  },
  {
    layerId: HYDROWAY_CONTEXT_LAYER_IDS.terminalsPoint,
    property: 'circle-color',
    value: '#d9fffb',
  },
  {
    layerId: HYDROWAY_CONTEXT_LAYER_IDS.terminalsPoint,
    property: 'circle-opacity',
    value: 0.7,
  },
  {
    layerId: HYDROWAY_CONTEXT_LAYER_IDS.terminalsPoint,
    property: 'circle-radius',
    value: ['interpolate', ['linear'], ['zoom'], 4, 3, 10, 4.5, 14, 5.5],
  },
  {
    layerId: HYDROWAY_CONTEXT_LAYER_IDS.infrastructurePoint,
    property: 'circle-color',
    value: '#f5c86a',
  },
  {
    layerId: HYDROWAY_CONTEXT_LAYER_IDS.infrastructurePoint,
    property: 'circle-opacity',
    value: 0.66,
  },
  {
    layerId: HYDROWAY_CONTEXT_LAYER_IDS.infrastructurePoint,
    property: 'circle-radius',
    value: ['interpolate', ['linear'], ['zoom'], 4, 3, 10, 4.5, 14, 5.5],
  },
  {
    layerId: HYDROWAY_CONTEXT_LAYER_IDS.signalsPoint,
    property: 'circle-color',
    value: '#7ffff2',
  },
  {
    layerId: HYDROWAY_CONTEXT_LAYER_IDS.signalsPoint,
    property: 'circle-opacity',
    value: 0.58,
  },
  {
    layerId: HYDROWAY_CONTEXT_LAYER_IDS.signalsPoint,
    property: 'circle-radius',
    value: ['interpolate', ['linear'], ['zoom'], 4, 2, 10, 2.8, 14, 3.5],
  },
  {
    layerId: HYDROWAY_CONTEXT_LAYER_IDS.basinsFill,
    property: 'fill-color',
    value: '#0daca0',
  },
  {
    layerId: HYDROWAY_CONTEXT_LAYER_IDS.basinsFill,
    property: 'fill-opacity',
    value: 0.03,
  },
  {
    layerId: HYDROWAY_CONTEXT_LAYER_IDS.basinsOutline,
    property: 'line-color',
    value: '#7ffff2',
  },
  {
    layerId: HYDROWAY_CONTEXT_LAYER_IDS.basinsOutline,
    property: 'line-opacity',
    value: 0.08,
  },
  {
    layerId: HYDROWAY_CONTEXT_LAYER_IDS.basinInfoPoint,
    property: 'circle-opacity',
    value: 0.48,
  },
  {
    layerId: HYDROWAY_CONTEXT_LAYER_IDS.alertZonesFill,
    property: 'fill-color',
    value: 'rgba(196, 148, 72, 0.06)',
  },
  {
    layerId: HYDROWAY_CONTEXT_LAYER_IDS.alertZonesFill,
    property: 'fill-opacity',
    value: 0.06,
  },
  {
    layerId: HYDROWAY_CONTEXT_LAYER_IDS.alertZonesOutline,
    property: 'line-color',
    value: 'rgba(196, 148, 72, 0.45)',
  },
  {
    layerId: HYDROWAY_CONTEXT_LAYER_IDS.alertZonesOutline,
    property: 'line-opacity',
    value: 0.18,
  },
  {
    layerId: HYDROWAY_CONTEXT_LAYER_IDS.alertPointsPoint,
    property: 'circle-opacity',
    value: 0.55,
  },
];

const SEMI_LIGHT_CONTEXT: HydrowayContextLayerVisibility = {
  corridors: 0.58,
  corridorsHighlight: 0.38,
  terminals: 0.48,
  infrastructure: 0.34,
  signals: 0.28,
  basins: 0.02,
  basinsOutline: 0.06,
  alerts: 0.14,
  alertsOutline: 0.22,
  showInfrastructureLabels: false,
};

const SEMI_LIGHT_CONTEXT_PAINT: MapPaintAdjustment[] = [
  {
    layerId: HYDROWAY_CONTEXT_LAYER_IDS.corridorsCore,
    property: 'line-color',
    value: 'rgba(48, 118, 148, 0.72)',
  },
  {
    layerId: HYDROWAY_CONTEXT_LAYER_IDS.terminalsPoint,
    property: 'circle-opacity',
    value: 0.52,
  },
  {
    layerId: HYDROWAY_CONTEXT_LAYER_IDS.basinsFill,
    property: 'fill-opacity',
    value: 0.02,
  },
];

const REALISTIC_CONTEXT: HydrowayContextLayerVisibility = {
  corridors: 0.38,
  corridorsHighlight: 0.22,
  terminals: 0.3,
  infrastructure: 0.22,
  signals: 0.18,
  basins: 0,
  basinsOutline: 0.04,
  alerts: 0.1,
  alertsOutline: 0.14,
  showInfrastructureLabels: false,
};

const REALISTIC_CONTEXT_PAINT: MapPaintAdjustment[] = [
  {
    layerId: HYDROWAY_CONTEXT_LAYER_IDS.corridorsCore,
    property: 'line-color',
    value: 'rgba(74, 128, 148, 0.65)',
  },
  {
    layerId: HYDROWAY_CONTEXT_LAYER_IDS.corridorsHighlight,
    property: 'line-color',
    value: 'rgba(90, 138, 158, 0.45)',
  },
  {
    layerId: HYDROWAY_CONTEXT_LAYER_IDS.terminalsPoint,
    property: 'circle-color',
    value: '#5a8fa0',
  },
  {
    layerId: HYDROWAY_CONTEXT_LAYER_IDS.signalsPoint,
    property: 'circle-color',
    value: '#6a9098',
  },
  {
    layerId: HYDROWAY_CONTEXT_LAYER_IDS.corridorInfoPoint,
    property: 'circle-opacity',
    value: 0.42,
  },
];

const WATERWAYS_CONTEXT: HydrowayContextLayerVisibility = {
  corridors: 0.96,
  corridorsHighlight: 0.78,
  terminals: 0.9,
  infrastructure: 0.72,
  signals: 0.82,
  basins: 0.1,
  basinsOutline: 0.22,
  alerts: 0.32,
  alertsOutline: 0.42,
  showInfrastructureLabels: false,
};

const WATERWAYS_CONTEXT_PAINT: MapPaintAdjustment[] = [
  {
    layerId: HYDROWAY_CONTEXT_LAYER_IDS.corridorsCore,
    property: 'line-color',
    value: '#1a9cb8',
  },
  {
    layerId: HYDROWAY_CONTEXT_LAYER_IDS.corridorsCore,
    property: 'line-opacity',
    value: 0.92,
  },
  {
    layerId: HYDROWAY_CONTEXT_LAYER_IDS.corridorsHighlight,
    property: 'line-opacity',
    value: 0.72,
  },
  {
    layerId: HYDROWAY_CONTEXT_LAYER_IDS.terminalsPoint,
    property: 'circle-opacity',
    value: 0.92,
  },
  {
    layerId: HYDROWAY_CONTEXT_LAYER_IDS.corridorInfoPoint,
    property: 'circle-opacity',
    value: 0.88,
  },
];

const GOVERNMENT_CONTEXT: HydrowayContextLayerVisibility = {
  corridors: 0.86,
  corridorsHighlight: 0.68,
  terminals: 0.92,
  infrastructure: 0.9,
  signals: 0.88,
  basins: 0.28,
  basinsOutline: 0.48,
  alerts: 0.38,
  alertsOutline: 0.52,
  showInfrastructureLabels: true,
};

const GOVERNMENT_CONTEXT_PAINT: MapPaintAdjustment[] = [
  {
    layerId: HYDROWAY_CONTEXT_LAYER_IDS.basinsFill,
    property: 'fill-opacity',
    value: 0.28,
  },
  {
    layerId: HYDROWAY_CONTEXT_LAYER_IDS.alertZonesFill,
    property: 'fill-opacity',
    value: 0.34,
  },
  {
    layerId: HYDROWAY_CONTEXT_LAYER_IDS.infrastructurePoint,
    property: 'circle-opacity',
    value: 0.92,
  },
  {
    layerId: HYDROWAY_CONTEXT_LAYER_IDS.basinInfoPoint,
    property: 'circle-opacity',
    value: 0.78,
  },
  {
    layerId: HYDROWAY_CONTEXT_LAYER_IDS.alertPointsPoint,
    property: 'circle-opacity',
    value: 0.85,
  },
];

const OPENFREEMAP_LANDUSE_FILL_LAYERS = [
  'landcover-glacier',
  'landuse-residential',
  'landuse-suburb',
  'landuse-commercial',
  'landuse-industrial',
  'landuse-cemetery',
  'landuse-hospital',
  'landuse-school',
  'landuse-railway',
  'park',
  'landcover-wood',
  'landcover-grass',
  'landcover-grass-park',
  'landcover-ice-shelf',
  'landcover-sand',
  'building',
  'building-top',
] as const;

const OPENFREEMAP_WATERWAY_LINE_LAYERS = [
  'waterway_tunnel',
  'waterway-other',
  'waterway-other-intermittent',
  'waterway-stream-canal',
  'waterway-stream-canal-intermittent',
  'waterway-river',
  'waterway-river-intermittent',
] as const;

const OPENFREEMAP_LABEL_LAYERS = [
  'waterway_line_label',
  'water_name_point_label',
  'water_name_line_label',
  'highway-name-path',
  'highway-name-minor',
  'highway-name-major',
  'label_other',
  'label_village',
  'label_town',
  'label_state',
  'label_city',
  'label_city_capital',
  'label_country_3',
  'label_country_2',
  'label_country_1',
] as const;

type BasemapVisualTokens = {
  background: string;
  waterFill: string;
  waterFillOpacity: number;
  waterwayLine: string;
  waterwayLineOpacity: number;
  landFillOpacity: number;
  labelTextOpacity: number;
  boundaryOpacity: number;
};

function buildOpenFreeMapBasemapPaint(tokens: BasemapVisualTokens): MapPaintAdjustment[] {
  const adjustments: MapPaintAdjustment[] = [
    { layerId: 'background', property: 'background-color', value: tokens.background },
    { layerId: 'water', property: 'fill-color', value: tokens.waterFill },
    { layerId: 'water', property: 'fill-opacity', value: tokens.waterFillOpacity },
    { layerId: 'water-intermittent', property: 'fill-color', value: tokens.waterFill },
    { layerId: 'water-intermittent', property: 'fill-opacity', value: tokens.waterFillOpacity * 0.72 },
    { layerId: 'boundary_2', property: 'line-opacity', value: tokens.boundaryOpacity },
    { layerId: 'boundary_3', property: 'line-opacity', value: tokens.boundaryOpacity * 0.85 },
  ];

  for (const layerId of OPENFREEMAP_WATERWAY_LINE_LAYERS) {
    adjustments.push(
      { layerId, property: 'line-color', value: tokens.waterwayLine },
      { layerId, property: 'line-opacity', value: tokens.waterwayLineOpacity },
    );
  }

  for (const layerId of OPENFREEMAP_LANDUSE_FILL_LAYERS) {
    adjustments.push({ layerId, property: 'fill-opacity', value: tokens.landFillOpacity });
  }

  for (const layerId of OPENFREEMAP_LABEL_LAYERS) {
    adjustments.push({ layerId, property: 'text-opacity', value: tokens.labelTextOpacity });
  }

  return adjustments;
}

function buildOverlayWaterwayPaint(
  mainColor: string,
  mainOpacity: number,
  corridorColor: string,
  corridorOpacity: number,
): MapPaintAdjustment[] {
  return [
    {
      layerId: HYDROWAY_MVP_OVERLAY_LAYER_IDS.waterwayMain,
      property: 'line-color',
      value: mainColor,
    },
    {
      layerId: HYDROWAY_MVP_OVERLAY_LAYER_IDS.waterwayMain,
      property: 'line-opacity',
      value: mainOpacity,
    },
    {
      layerId: HYDROWAY_MVP_OVERLAY_LAYER_IDS.waterwayCorridor,
      property: 'line-color',
      value: corridorColor,
    },
    {
      layerId: HYDROWAY_MVP_OVERLAY_LAYER_IDS.waterwayCorridor,
      property: 'line-opacity',
      value: corridorOpacity,
    },
  ];
}

function buildOverlayRoutePaint(
  palette: RouteFlowPalette,
  casingOpacity: number,
  trackCoreOpacity: number,
  glowOpacity: number,
): MapPaintAdjustment[] {
  return [
    {
      layerId: HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeTrackCasing,
      property: 'line-color',
      value: palette.trackCasing,
    },
    {
      layerId: HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeTrackCasing,
      property: 'line-opacity',
      value: casingOpacity,
    },
    {
      layerId: HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeTrackGlow,
      property: 'line-color',
      value: palette.glow,
    },
    {
      layerId: HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeTrackGlow,
      property: 'line-opacity',
      value: glowOpacity,
    },
    {
      layerId: HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeTrackCore,
      property: 'line-color',
      value: palette.base,
    },
    {
      layerId: HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeTrackCore,
      property: 'line-opacity',
      value: trackCoreOpacity,
    },
    {
      layerId: HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeFlowRiverMist,
      property: 'line-color',
      value: palette.glow,
    },
    {
      layerId: HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeFlowDestination,
      property: 'line-color',
      value: palette.flow,
    },
  ];
}

const DARK_ROUTE_FLOW: RouteFlowPalette = {
  base: '#4dc4b8',
  glow: '#3db8ac',
  flow: '#52c9bc',
  highlight: '#d4b86a',
  trackCasing: 'rgba(5, 12, 16, 0.62)',
  traveledBody: 'rgba(77, 196, 184, 0.78)',
  traveledHighlight: 'rgba(212, 184, 106, 0.68)',
  traveledHead: 'rgba(82, 201, 188, 0.9)',
  remainingBody: 'rgba(77, 196, 184, 0.26)',
  remainingTail: 'rgba(61, 184, 172, 0.14)',
  traveledGlowOpacity: 0.26,
  traveledOpacity: 0.76,
  remainingOpacity: 0.26,
};

const SEMI_LIGHT_ROUTE_FLOW: RouteFlowPalette = {
  base: '#2a9d8f',
  glow: '#3db8a8',
  flow: '#2ec4b6',
  highlight: '#c9a227',
  trackCasing: 'rgba(30, 58, 72, 0.38)',
  traveledBody: 'rgba(42, 157, 143, 0.78)',
  traveledHighlight: 'rgba(201, 162, 39, 0.62)',
  traveledHead: 'rgba(46, 196, 182, 0.9)',
  remainingBody: 'rgba(42, 157, 143, 0.32)',
  remainingTail: 'rgba(61, 184, 168, 0.2)',
  traveledGlowOpacity: 0.26,
  traveledOpacity: 0.74,
  remainingOpacity: 0.32,
};

const REALISTIC_ROUTE_FLOW: RouteFlowPalette = {
  base: '#4a8f9c',
  glow: '#5a9fad',
  flow: '#4d8f99',
  highlight: '#b89a4a',
  trackCasing: 'rgba(36, 52, 58, 0.32)',
  traveledBody: 'rgba(74, 143, 156, 0.72)',
  traveledHighlight: 'rgba(184, 154, 74, 0.55)',
  traveledHead: 'rgba(90, 159, 173, 0.85)',
  remainingBody: 'rgba(74, 143, 156, 0.28)',
  remainingTail: 'rgba(90, 159, 173, 0.18)',
  traveledGlowOpacity: 0.22,
  traveledOpacity: 0.68,
  remainingOpacity: 0.3,
};

const WATERWAYS_ROUTE_FLOW: RouteFlowPalette = {
  base: '#3d9cb8',
  glow: '#4ab0cc',
  flow: '#45a8c4',
  highlight: '#d4b85c',
  trackCasing: 'rgba(20, 48, 62, 0.4)',
  traveledBody: 'rgba(61, 156, 184, 0.8)',
  traveledHighlight: 'rgba(212, 184, 92, 0.65)',
  traveledHead: 'rgba(69, 168, 196, 0.92)',
  remainingBody: 'rgba(61, 156, 184, 0.3)',
  remainingTail: 'rgba(74, 176, 204, 0.18)',
  traveledGlowOpacity: 0.3,
  traveledOpacity: 0.76,
  remainingOpacity: 0.3,
};

const GOVERNMENT_ROUTE_FLOW: RouteFlowPalette = {
  base: '#2f6f8f',
  glow: '#3a7f9f',
  flow: '#356f85',
  highlight: '#8a9aaf',
  trackCasing: 'rgba(28, 44, 58, 0.45)',
  traveledBody: 'rgba(47, 111, 143, 0.78)',
  traveledHighlight: 'rgba(138, 154, 175, 0.62)',
  traveledHead: 'rgba(58, 127, 159, 0.9)',
  remainingBody: 'rgba(47, 111, 143, 0.3)',
  remainingTail: 'rgba(58, 127, 159, 0.2)',
  traveledGlowOpacity: 0.24,
  traveledOpacity: 0.72,
  remainingOpacity: 0.32,
};

export const HYDROWAY_MAP_LAYER_PRESET_ORDER: readonly HydrowayMapLayerPresetId[] = [
  'dark',
  'semiLight',
  'realistic',
  'waterways',
  'government',
];

export const HYDROWAY_MAP_LAYER_PRESETS: Record<HydrowayMapLayerPresetId, HydrowayMapLayerPresetConfig> = {
  dark: {
    id: 'dark',
    labelKey: 'layerPresetDark',
    descriptionKey: 'layerPresetDarkDescription',
    basemapPaint: buildOpenFreeMapBasemapPaint({
      background: '#03080b',
      waterFill: '#0f2a32',
      waterFillOpacity: 0.92,
      waterwayLine: '#1a7a82',
      waterwayLineOpacity: 0.62,
      landFillOpacity: 0.14,
      labelTextOpacity: 0.28,
      boundaryOpacity: 0.18,
    }),
    waterwayPaint: buildOverlayWaterwayPaint(
      'rgba(13, 172, 160, 0.72)',
      0.78,
      'rgba(127, 255, 242, 0.42)',
      0.52,
    ),
    routePaint: buildOverlayRoutePaint(DARK_ROUTE_FLOW, 0.48, 0.58, 0.16),
    routeFlowPalette: DARK_ROUTE_FLOW,
    contextLayers: DARK_CONTEXT,
    contextPaint: DARK_CONTEXT_PAINT,
  },
  semiLight: {
    id: 'semiLight',
    labelKey: 'layerPresetSemiLight',
    descriptionKey: 'layerPresetSemiLightDescription',
    basemapPaint: buildOpenFreeMapBasemapPaint({
      background: '#d4dfe8',
      waterFill: '#6a9fb8',
      waterFillOpacity: 0.78,
      waterwayLine: '#4a8aa8',
      waterwayLineOpacity: 0.72,
      landFillOpacity: 0.62,
      labelTextOpacity: 0.82,
      boundaryOpacity: 0.45,
    }),
    waterwayPaint: buildOverlayWaterwayPaint(
      'rgba(42, 118, 148, 0.82)',
      0.84,
      'rgba(52, 132, 162, 0.72)',
      0.76,
    ),
    routePaint: buildOverlayRoutePaint(SEMI_LIGHT_ROUTE_FLOW, 0.42, 0.58, 0.16),
    routeFlowPalette: SEMI_LIGHT_ROUTE_FLOW,
    contextLayers: SEMI_LIGHT_CONTEXT,
    contextPaint: SEMI_LIGHT_CONTEXT_PAINT,
  },
  realistic: {
    id: 'realistic',
    labelKey: 'layerPresetRealistic',
    descriptionKey: 'layerPresetRealisticDescription',
    basemapPaint: buildOpenFreeMapBasemapPaint({
      background: '#c8d2cc',
      waterFill: '#5a8fa0',
      waterFillOpacity: 0.72,
      waterwayLine: '#4d7f8f',
      waterwayLineOpacity: 0.68,
      landFillOpacity: 0.58,
      labelTextOpacity: 0.75,
      boundaryOpacity: 0.4,
    }),
    waterwayPaint: buildOverlayWaterwayPaint(
      'rgba(74, 128, 148, 0.78)',
      0.8,
      'rgba(82, 138, 158, 0.68)',
      0.72,
    ),
    routePaint: buildOverlayRoutePaint(REALISTIC_ROUTE_FLOW, 0.36, 0.52, 0.14),
    routeFlowPalette: REALISTIC_ROUTE_FLOW,
    contextLayers: REALISTIC_CONTEXT,
    contextPaint: REALISTIC_CONTEXT_PAINT,
  },
  waterways: {
    id: 'waterways',
    labelKey: 'layerPresetWaterways',
    descriptionKey: 'layerPresetWaterwaysDescription',
    basemapPaint: buildOpenFreeMapBasemapPaint({
      background: '#b8ccd8',
      waterFill: '#2d7a9a',
      waterFillOpacity: 0.9,
      waterwayLine: '#1f6f8f',
      waterwayLineOpacity: 0.9,
      landFillOpacity: 0.38,
      labelTextOpacity: 0.48,
      boundaryOpacity: 0.32,
    }),
    waterwayPaint: buildOverlayWaterwayPaint(
      'rgba(32, 140, 168, 0.95)',
      0.94,
      'rgba(40, 158, 188, 0.88)',
      0.9,
    ),
    routePaint: buildOverlayRoutePaint(WATERWAYS_ROUTE_FLOW, 0.4, 0.6, 0.18),
    routeFlowPalette: WATERWAYS_ROUTE_FLOW,
    contextLayers: WATERWAYS_CONTEXT,
    contextPaint: WATERWAYS_CONTEXT_PAINT,
  },
  government: {
    id: 'government',
    labelKey: 'layerPresetGovernment',
    descriptionKey: 'layerPresetGovernmentDescription',
    basemapPaint: buildOpenFreeMapBasemapPaint({
      background: '#e6eaee',
      waterFill: '#4a7c9b',
      waterFillOpacity: 0.8,
      waterwayLine: '#2d6a8a',
      waterwayLineOpacity: 0.78,
      landFillOpacity: 0.52,
      labelTextOpacity: 0.7,
      boundaryOpacity: 0.5,
    }),
    waterwayPaint: buildOverlayWaterwayPaint(
      'rgba(45, 106, 138, 0.88)',
      0.86,
      'rgba(58, 120, 152, 0.8)',
      0.78,
    ),
    routePaint: buildOverlayRoutePaint(GOVERNMENT_ROUTE_FLOW, 0.48, 0.56, 0.15),
    routeFlowPalette: GOVERNMENT_ROUTE_FLOW,
    contextLayers: GOVERNMENT_CONTEXT,
    contextPaint: GOVERNMENT_CONTEXT_PAINT,
    unavailableLayerHints: [
      'ports-terminals',
      'locks',
      'dams',
      'signaling',
      'buoyage',
      'hydrographic-basins',
    ],
  },
};

export const DEFAULT_HYDROWAY_MAP_LAYER_PRESET_ID: HydrowayMapLayerPresetId = 'dark';

export function resolveHydrowayMapLayerPreset(
  presetId: HydrowayMapLayerPresetId,
): HydrowayMapLayerPresetConfig {
  return HYDROWAY_MAP_LAYER_PRESETS[presetId];
}

export function isHydrowayMapLayerPresetId(value: string): value is HydrowayMapLayerPresetId {
  return value in HYDROWAY_MAP_LAYER_PRESETS;
}
