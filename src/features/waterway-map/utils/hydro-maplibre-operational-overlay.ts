import type {
  ExpressionSpecification,
  FilterSpecification,
  GeoJSONSource,
  LayerSpecification,
  Map,
  SourceSpecification,
} from 'maplibre-gl';

import type { HydrowayOperationalDatasetSlice } from '../domain/hydroway-operational-domain.types';
import type { HydrowayOperationalLayerMode } from '../domain/hydroway-operational-domain.types';
import { OPERATIONAL_MODE_LEGEND } from '../constants/hydroway-operational-layer-legend';
import {
  toAlertsFeatureCollection,
  toCheckpointsFeatureCollection,
  toCorridorsFeatureCollection,
  toPlanningAreasFeatureCollection,
  toSegmentsFeatureCollection,
  mergeSegmentAndPlanningIconPoints,
  mergeAttentionIconPoints,
  toSignalsFeatureCollection,
  toTerminalsFeatureCollection,
} from './hydroway-operational-geojson';
import { HYDRI_MAPLIBRE_TEXT_FONT_LAYOUT } from './hydro-maplibre-glyphs';
import { layerExistsOnMap } from './hydro-maplibre-overlay';
import { HYDROWAY_MVP_OVERLAY_LAYER_IDS } from './hydro-maplibre-overlay';

export const HYDRI_OP_SOURCE_IDS = {
  corridors: 'hydri-op-corridors-source',
  segments: 'hydri-op-segments-source',
  terminals: 'hydri-op-terminals-source',
  alerts: 'hydri-op-alerts-source',
  signals: 'hydri-op-signals-source',
  planningAreas: 'hydri-op-planning-areas-source',
  planningLabels: 'hydri-op-planning-labels-source',
  checkpoints: 'hydri-op-checkpoints-source',
  segmentIcons: 'hydri-op-segment-icons-source',
} as const;

export const HYDRI_OP_ICON_LAYER_IDS = {
  alertsIconBadge: 'hydri-op-alerts-icon-badge',
  alertsIcon: 'hydri-op-alerts-icon',
  alertsCriticalIconBadge: 'hydri-op-alerts-critical-icon-badge',
  alertsCriticalIcon: 'hydri-op-alerts-critical-icon',
  draftRestrictionIconBadge: 'hydri-op-draft-restriction-icon-badge',
  draftRestrictionIcon: 'hydri-op-draft-restriction-icon',
  dredgingIconBadge: 'hydri-op-dredging-icon-badge',
  dredgingIcon: 'hydri-op-dredging-icon',
  signalsIconBadge: 'hydri-op-signals-icon-badge',
  signalsIcon: 'hydri-op-signals-icon',
  terminalsIconBadge: 'hydri-op-terminals-icon-badge',
  terminalsIcon: 'hydri-op-terminals-icon',
  checkpointsIconBadge: 'hydri-op-checkpoints-icon-badge',
  checkpointsIcon: 'hydri-op-checkpoints-icon',
  governmentIconBadge: 'hydri-op-government-icon-badge',
  governmentIcon: 'hydri-op-government-icon',
} as const;

/** Symbol layers only — used for visibility/debug. */
export const HYDRI_OP_ICON_SYMBOL_LAYER_IDS = {
  alertsIcon: HYDRI_OP_ICON_LAYER_IDS.alertsIcon,
  alertsCriticalIcon: HYDRI_OP_ICON_LAYER_IDS.alertsCriticalIcon,
  draftRestrictionIcon: HYDRI_OP_ICON_LAYER_IDS.draftRestrictionIcon,
  dredgingIcon: HYDRI_OP_ICON_LAYER_IDS.dredgingIcon,
  signalsIcon: HYDRI_OP_ICON_LAYER_IDS.signalsIcon,
  terminalsIcon: HYDRI_OP_ICON_LAYER_IDS.terminalsIcon,
  checkpointsIcon: HYDRI_OP_ICON_LAYER_IDS.checkpointsIcon,
  governmentIcon: HYDRI_OP_ICON_LAYER_IDS.governmentIcon,
} as const;

export const HYDRI_OP_LAYER_IDS = {
  corridorsShadow: 'hydri-op-corridors-shadow',
  corridorsCore: 'hydri-op-corridors-core',
  corridorsHighlight: 'hydri-op-corridors-highlight',
  segmentsNormal: 'hydri-op-segments-normal',
  segmentsAttention: 'hydri-op-segments-attention',
  segmentsRestricted: 'hydri-op-segments-restricted',
  segmentsDredging: 'hydri-op-segments-dredging',
  terminalsHalo: 'hydri-op-terminals-halo',
  terminalsPoint: 'hydri-op-terminals-point',
  terminalsLabel: 'hydri-op-terminals-label',
  alertsHalo: 'hydri-op-alerts-halo',
  alertsPoint: 'hydri-op-alerts-point',
  alertsCriticalRing: 'hydri-op-alerts-critical-ring',
  signalsPoint: 'hydri-op-signals-point',
  signalsAttention: 'hydri-op-signals-attention',
  planningAreasFill: 'hydri-op-planning-areas-fill',
  planningAreasOutline: 'hydri-op-planning-areas-outline',
  planningAreasLabel: 'hydri-op-planning-areas-label',
  checkpointsHalo: 'hydri-op-checkpoints-halo',
  checkpointsPoint: 'hydri-op-checkpoints-point',
  checkpointsLabel: 'hydri-op-checkpoints-label',
  ...HYDRI_OP_ICON_SYMBOL_LAYER_IDS,
} as const;

const EMPTY_FC: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] };

const SEGMENT_COLORS = {
  normal: '#22C55E',
  attention: '#F59E0B',
  restricted: '#EF4444',
  dredging: '#2563EB',
} as const;

const SIGNAL_COLORS = {
  ok: '#22C55E',
  attention: '#F59E0B',
} as const;

const CORRIDOR_OPERATION = '#00E6D0';
const TERMINAL_LOGISTICS = '#8B5CF6';
const CHECKPOINT_OPERATION = '#00E6D0';
const CHECKPOINT_HALO_OPERATION = '#7FFFF2';
const ALERT_WARNING = '#FFB020';
const ALERT_CRITICAL = '#FF3B30';
const ALERT_INFO = '#38BDF8';
const PLANNING_FILL = '#2563EB';
const PLANNING_FILL_ALT = '#A855F7';
const PLANNING_OUTLINE = '#E0F2FE';

type OpLabelLayerKey = 'terminalsLabel' | 'checkpointsLabel' | 'planningAreasLabel';
type OpIconLayerKey = keyof typeof HYDRI_OP_ICON_SYMBOL_LAYER_IDS;

type OpLayerPaintKey = Exclude<
  keyof typeof HYDRI_OP_LAYER_IDS,
  OpLabelLayerKey | OpIconLayerKey
>;

type OpIconVisual = {
  visibility: 'visible' | 'none';
  opacity: number;
  filter?: FilterSpecification | null;
  textSize?: number;
};

type OperationalModeIconVisualConfig = Record<OpIconLayerKey, OpIconVisual>;

type OpLayerVisual = {
  visibility: 'visible' | 'none';
  opacity: number;
  lineWidth?: number;
  circleRadius?: number;
  lineColor?: string;
  circleColor?: string;
  circleStrokeColor?: string;
  circleStrokeWidth?: number;
  fillColor?: string;
  lineDasharray?: number[];
  filter?: FilterSpecification | null;
};

export type OperationalModePaintConfig = Record<OpLayerPaintKey, number> & {
  terminalsLabelVisibility: 'visible' | 'none';
  checkpointsLabelVisibility: 'visible' | 'none';
  planningLabelVisibility: 'visible' | 'none';
};

type OperationalModeVisualConfig = Record<OpLayerPaintKey, OpLayerVisual> & {
  terminalsLabelVisibility: 'visible' | 'none';
  checkpointsLabelVisibility: 'visible' | 'none';
  planningLabelVisibility: 'visible' | 'none';
};

const OP_OPERATION = '#00E6D0';
const OP_OPERATION_SUPPORT = '#7FFFF2';
const OP_NAV_NORMAL = '#22C55E';
const OP_ATTENTION = '#F59E0B';
const OP_RESTRICTED = '#EF4444';
const OP_DREDGING = '#2563EB';
const OP_LOGISTICS = '#8B5CF6';
const OP_LOGISTICS_SUPPORT = '#38BDF8';
const OP_LOGISTICS_BOTTLENECK = '#F97316';
const OP_RISK_DOMINANT = '#FF2D55';
const OP_RISK_CRITICAL = '#FF3B30';
const OP_RISK_WARNING = '#FFB020';
const OP_GOV_PRIMARY = '#2563EB';
const OP_GOV_PLANNING_ALT = '#A855F7';
const OP_GOV_OUTLINE = '#E0F2FE';

/** Cores dominantes exclusivas por modo — usadas em debug e testes. */
export const OPERATIONAL_MODE_DOMINANT_COLORS: Record<
  HydrowayOperationalLayerMode,
  Record<string, string>
> = {
  operation: {
    corridorColor: OP_OPERATION,
    checkpointColor: OP_OPERATION_SUPPORT,
    alertColor: OP_RISK_WARNING,
  },
  navigation: {
    normalColor: OP_NAV_NORMAL,
    attentionColor: OP_ATTENTION,
    restrictedColor: OP_RESTRICTED,
    dredgingColor: OP_DREDGING,
  },
  logistics: {
    terminalColor: OP_LOGISTICS,
    checkpointColor: OP_LOGISTICS_SUPPORT,
    bottleneckColor: OP_LOGISTICS_BOTTLENECK,
  },
  risk: {
    criticalColor: OP_RISK_DOMINANT,
    warningColor: OP_RISK_WARNING,
    restrictedColor: OP_RESTRICTED,
  },
  government: {
    corridorColor: OP_GOV_PRIMARY,
    planningColor: OP_GOV_PLANNING_ALT,
    outlineColor: OP_GOV_OUTLINE,
  },
};

function opVisible(opacity: number, extras: Omit<OpLayerVisual, 'visibility' | 'opacity'> = {}): OpLayerVisual {
  return {
    visibility: opacity <= 0.01 ? 'none' : 'visible',
    opacity,
    ...extras,
  };
}

function opHidden(): OpLayerVisual {
  return { visibility: 'none', opacity: 0 };
}

const FILTER_ALERT_WARNING_CRITICAL: FilterSpecification = [
  'in',
  ['get', 'severity'],
  ['literal', ['warning', 'critical']],
];

const FILTER_ALERT_RISK: FilterSpecification = [
  'in',
  ['get', 'severity'],
  ['literal', ['warning', 'critical', 'info']],
];

const FILTER_ALERT_LOGISTICS: FilterSpecification = [
  'in',
  ['get', 'type'],
  ['literal', ['port-window', 'traffic']],
];

const FILTER_ALERT_CRITICAL: FilterSpecification = ['==', ['get', 'severity'], 'critical'];

const FILTER_ALERT_NON_CRITICAL: FilterSpecification = ['!=', ['get', 'severity'], 'critical'];

const FILTER_ALERT_NAVIGATION: FilterSpecification = [
  'any',
  ['in', ['get', 'type'], ['literal', ['draft', 'dredging', 'signaling', 'visibility']]],
  ['in', ['get', 'severity'], ['literal', ['warning', 'info']]],
];

const FILTER_SIGNAL_ATTENTION_ICON: FilterSpecification = [
  'in',
  ['get', 'condition'],
  ['literal', ['attention', 'maintenance']],
];

const FILTER_TERMINAL_ETA: FilterSpecification = [
  'in',
  ['get', 'etaRelevance'],
  ['literal', ['destination', 'next-stop', 'origin']],
];

const FILTER_CHECKPOINT_OPERATION: FilterSpecification = [
  'in',
  ['get', 'type'],
  ['literal', ['next-terminal', 'current-cargo', 'risk-point', 'destination']],
];

const FILTER_SEGMENT_DRAFT_ICON: FilterSpecification = ['==', ['get', 'iconKind'], 'draft-restriction'];

const FILTER_SEGMENT_DREDGING_ICON: FilterSpecification = ['==', ['get', 'iconKind'], 'dredging'];

const FILTER_CHECKPOINT_RISK_ICON: FilterSpecification = ['==', ['get', 'iconKind'], 'draft-restriction'];

const FILTER_TERMINAL_LABEL: FilterSpecification = [
  'any',
  ['in', ['get', 'importance'], ['literal', ['national', 'regional']]],
  ['in', ['get', 'etaRelevance'], ['literal', ['destination', 'next-stop', 'origin']]],
];

const OPERATIONAL_MODE_VISUALS: Record<HydrowayOperationalLayerMode, OperationalModeVisualConfig> = {
  operation: {
    corridorsShadow: opVisible(0.34, { lineWidth: 10, lineColor: OP_OPERATION }),
    corridorsCore: opVisible(0.82, { lineWidth: 7.5, lineColor: OP_OPERATION }),
    corridorsHighlight: opVisible(0.28, { lineWidth: 13, lineColor: OP_OPERATION_SUPPORT }),
    segmentsNormal: opHidden(),
    segmentsAttention: opHidden(),
    segmentsRestricted: opHidden(),
    segmentsDredging: opHidden(),
    terminalsHalo: opVisible(0.14, { circleRadius: 10, circleColor: OP_OPERATION_SUPPORT }),
    terminalsPoint: opVisible(0.32, { circleRadius: 4.5, circleColor: OP_OPERATION }),
    terminalsLabelVisibility: 'none',
    alertsHalo: opVisible(0.42, { circleRadius: 14, circleColor: OP_RISK_WARNING }),
    alertsPoint: opVisible(0.78, {
      circleRadius: 6.5,
      circleColor: OP_RISK_CRITICAL,
      filter: FILTER_ALERT_WARNING_CRITICAL,
    }),
    alertsCriticalRing: opVisible(0.72, {
      circleRadius: 13,
      circleStrokeColor: OP_RISK_CRITICAL,
      filter: FILTER_ALERT_CRITICAL,
    }),
    signalsPoint: opHidden(),
    signalsAttention: opHidden(),
    planningAreasFill: opHidden(),
    planningAreasOutline: opHidden(),
    planningLabelVisibility: 'none',
    checkpointsHalo: opVisible(0.48, { circleRadius: 16, circleColor: OP_OPERATION_SUPPORT }),
    checkpointsPoint: opVisible(0.94, { circleRadius: 7.5, circleColor: OP_OPERATION }),
    checkpointsLabelVisibility: 'none',
  },
  navigation: {
    corridorsShadow: opHidden(),
    corridorsCore: opHidden(),
    corridorsHighlight: opHidden(),
    segmentsNormal: opVisible(0.9, { lineWidth: 5.5, lineColor: OP_NAV_NORMAL }),
    segmentsAttention: opVisible(0.96, { lineWidth: 9.5, lineColor: OP_ATTENTION }),
    segmentsRestricted: opVisible(0.97, { lineWidth: 10.5, lineColor: OP_RESTRICTED }),
    segmentsDredging: opVisible(0.94, {
      lineWidth: 7.5,
      lineColor: OP_DREDGING,
      lineDasharray: [2.5, 1.4],
    }),
    terminalsHalo: opVisible(0.05, { circleRadius: 6 }),
    terminalsPoint: opVisible(0.16, { circleRadius: 3.2 }),
    terminalsLabelVisibility: 'none',
    alertsHalo: opVisible(0.18, { circleRadius: 8 }),
    alertsPoint: opVisible(0.36, { circleRadius: 4 }),
    alertsCriticalRing: opVisible(0.45, { circleRadius: 8 }),
    signalsPoint: opVisible(0.88, { circleRadius: 5.5, circleColor: OP_NAV_NORMAL }),
    signalsAttention: opVisible(0.96, { circleRadius: 8.5, circleColor: OP_ATTENTION }),
    planningAreasFill: opHidden(),
    planningAreasOutline: opHidden(),
    planningLabelVisibility: 'none',
    checkpointsHalo: opVisible(0.06, { circleRadius: 5 }),
    checkpointsPoint: opVisible(0.12, { circleRadius: 3 }),
    checkpointsLabelVisibility: 'none',
  },
  logistics: {
    corridorsShadow: opVisible(0.08, { lineWidth: 2.5, lineColor: OP_LOGISTICS }),
    corridorsCore: opVisible(0.2, { lineWidth: 2.8, lineColor: OP_LOGISTICS }),
    corridorsHighlight: opVisible(0.05, { lineWidth: 3.5, lineColor: OP_LOGISTICS_SUPPORT }),
    segmentsNormal: opVisible(0.06, { lineWidth: 1.8, lineColor: OP_LOGISTICS }),
    segmentsAttention: opVisible(0.08, { lineWidth: 2 }),
    segmentsRestricted: opVisible(0.06, { lineWidth: 2 }),
    segmentsDredging: opVisible(0.06, { lineWidth: 2 }),
    terminalsHalo: opVisible(0.52, { circleRadius: 20, circleColor: OP_LOGISTICS }),
    terminalsPoint: opVisible(0.96, { circleRadius: 8.5, circleColor: OP_LOGISTICS }),
    terminalsLabelVisibility: 'visible',
    alertsHalo: opVisible(0.5, { circleRadius: 15, circleColor: OP_LOGISTICS_BOTTLENECK }),
    alertsPoint: opVisible(0.92, {
      circleRadius: 7,
      circleColor: OP_LOGISTICS_BOTTLENECK,
      filter: FILTER_ALERT_LOGISTICS,
    }),
    alertsCriticalRing: opVisible(0.48, { circleRadius: 11, circleColor: OP_LOGISTICS_BOTTLENECK }),
    signalsPoint: opHidden(),
    signalsAttention: opHidden(),
    planningAreasFill: opHidden(),
    planningAreasOutline: opHidden(),
    planningLabelVisibility: 'none',
    checkpointsHalo: opVisible(0.4, { circleRadius: 15, circleColor: OP_LOGISTICS_SUPPORT }),
    checkpointsPoint: opVisible(0.94, { circleRadius: 7.5, circleColor: OP_LOGISTICS_SUPPORT }),
    checkpointsLabelVisibility: 'visible',
  },
  risk: {
    corridorsShadow: opVisible(0.03, { lineWidth: 1.8 }),
    corridorsCore: opVisible(0.08, { lineWidth: 2 }),
    corridorsHighlight: opVisible(0.02, { lineWidth: 2.5 }),
    segmentsNormal: opHidden(),
    segmentsAttention: opVisible(0.84, { lineWidth: 8, lineColor: OP_RISK_WARNING }),
    segmentsRestricted: opVisible(0.96, { lineWidth: 10.5, lineColor: OP_RESTRICTED }),
    segmentsDredging: opVisible(0.82, {
      lineWidth: 7,
      lineColor: OP_DREDGING,
      lineDasharray: [2.5, 1.4],
    }),
    terminalsHalo: opVisible(0.05, { circleRadius: 5 }),
    terminalsPoint: opVisible(0.14, { circleRadius: 3 }),
    terminalsLabelVisibility: 'none',
    alertsHalo: opVisible(0.72, { circleRadius: 18, circleColor: OP_RISK_DOMINANT }),
    alertsPoint: opVisible(0.94, {
      circleRadius: 9.5,
      circleColor: OP_RISK_DOMINANT,
      filter: FILTER_ALERT_RISK,
    }),
    alertsCriticalRing: opVisible(0.88, {
      circleRadius: 22,
      circleStrokeColor: OP_RISK_CRITICAL,
      circleStrokeWidth: 2.8,
      filter: FILTER_ALERT_CRITICAL,
    }),
    signalsPoint: opHidden(),
    signalsAttention: opHidden(),
    planningAreasFill: opHidden(),
    planningAreasOutline: opHidden(),
    planningLabelVisibility: 'none',
    checkpointsHalo: opVisible(0.08, { circleRadius: 5 }),
    checkpointsPoint: opVisible(0.18, { circleRadius: 3.5 }),
    checkpointsLabelVisibility: 'none',
  },
  government: {
    corridorsShadow: opVisible(0.3, { lineWidth: 8, lineColor: OP_GOV_PRIMARY }),
    corridorsCore: opVisible(0.76, { lineWidth: 7.5, lineColor: OP_GOV_PRIMARY }),
    corridorsHighlight: opVisible(0.26, { lineWidth: 11, lineColor: OP_GOV_OUTLINE }),
    segmentsNormal: opHidden(),
    segmentsAttention: opHidden(),
    segmentsRestricted: opHidden(),
    segmentsDredging: opHidden(),
    terminalsHalo: opVisible(0.04, { circleRadius: 5 }),
    terminalsPoint: opVisible(0.22, { circleRadius: 3.2 }),
    terminalsLabelVisibility: 'none',
    alertsHalo: opVisible(0.05, { circleRadius: 5 }),
    alertsPoint: opVisible(0.22, { circleRadius: 3 }),
    alertsCriticalRing: opVisible(0.06, { circleRadius: 4 }),
    signalsPoint: opHidden(),
    signalsAttention: opHidden(),
    planningAreasFill: opVisible(0.2),
    planningAreasOutline: opVisible(0.58, {
      lineWidth: 2.4,
      lineColor: OP_GOV_OUTLINE,
    }),
    planningLabelVisibility: 'visible',
    checkpointsHalo: opVisible(0.04, { circleRadius: 4 }),
    checkpointsPoint: opVisible(0.08, { circleRadius: 2.8 }),
    checkpointsLabelVisibility: 'none',
  },
};

function opIconVisible(
  opacity: number,
  extras: Omit<OpIconVisual, 'visibility' | 'opacity'> = {},
): OpIconVisual {
  return {
    visibility: opacity <= 0.01 ? 'none' : 'visible',
    opacity,
    ...extras,
  };
}

function opIconHidden(): OpIconVisual {
  return { visibility: 'none', opacity: 0 };
}

const OPERATIONAL_MODE_ICON_VISUALS: Record<
  HydrowayOperationalLayerMode,
  OperationalModeIconVisualConfig
> = {
  operation: {
    alertsIcon: opIconVisible(0.94, { filter: FILTER_ALERT_WARNING_CRITICAL, textSize: 16 }),
    alertsCriticalIcon: opIconVisible(0.98, { filter: FILTER_ALERT_CRITICAL, textSize: 18 }),
    draftRestrictionIcon: opIconHidden(),
    dredgingIcon: opIconHidden(),
    signalsIcon: opIconHidden(),
    terminalsIcon: opIconVisible(0.82, { filter: FILTER_TERMINAL_ETA, textSize: 15 }),
    checkpointsIcon: opIconVisible(0.98, { filter: FILTER_CHECKPOINT_OPERATION, textSize: 16 }),
    governmentIcon: opIconHidden(),
  },
  navigation: {
    alertsIcon: opIconVisible(0.96, { filter: FILTER_ALERT_NAVIGATION, textSize: 16 }),
    alertsCriticalIcon: opIconVisible(0.98, { filter: FILTER_ALERT_CRITICAL, textSize: 18 }),
    draftRestrictionIcon: opIconVisible(0.98, { filter: FILTER_SEGMENT_DRAFT_ICON, textSize: 17 }),
    dredgingIcon: opIconVisible(0.96, { filter: FILTER_SEGMENT_DREDGING_ICON, textSize: 16 }),
    signalsIcon: opIconVisible(0.98, { filter: FILTER_SIGNAL_ATTENTION_ICON, textSize: 16 }),
    terminalsIcon: opIconHidden(),
    checkpointsIcon: opIconVisible(0.88, { filter: FILTER_CHECKPOINT_RISK_ICON, textSize: 15 }),
    governmentIcon: opIconHidden(),
  },
  logistics: {
    alertsIcon: opIconVisible(0.98, { filter: FILTER_ALERT_LOGISTICS, textSize: 17 }),
    alertsCriticalIcon: opIconHidden(),
    draftRestrictionIcon: opIconHidden(),
    dredgingIcon: opIconHidden(),
    signalsIcon: opIconHidden(),
    terminalsIcon: opIconVisible(0.98, { textSize: 17 }),
    checkpointsIcon: opIconVisible(0.96, { textSize: 16 }),
    governmentIcon: opIconHidden(),
  },
  risk: {
    alertsIcon: opIconVisible(0.98, { filter: FILTER_ALERT_WARNING_CRITICAL, textSize: 18 }),
    alertsCriticalIcon: opIconVisible(1, { filter: FILTER_ALERT_CRITICAL, textSize: 20 }),
    draftRestrictionIcon: opIconVisible(0.98, { filter: FILTER_SEGMENT_DRAFT_ICON, textSize: 17 }),
    dredgingIcon: opIconVisible(0.96, { filter: FILTER_SEGMENT_DREDGING_ICON, textSize: 16 }),
    signalsIcon: opIconHidden(),
    terminalsIcon: opIconHidden(),
    checkpointsIcon: opIconVisible(0.9, { filter: FILTER_CHECKPOINT_RISK_ICON, textSize: 16 }),
    governmentIcon: opIconHidden(),
  },
  government: {
    alertsIcon: opIconHidden(),
    alertsCriticalIcon: opIconHidden(),
    draftRestrictionIcon: opIconHidden(),
    dredgingIcon: opIconVisible(0.92, { filter: FILTER_SEGMENT_DREDGING_ICON, textSize: 15 }),
    signalsIcon: opIconHidden(),
    terminalsIcon: opIconHidden(),
    checkpointsIcon: opIconHidden(),
    governmentIcon: opIconVisible(0.96, {
      filter: ['==', ['get', 'iconKind'], 'government'],
      textSize: 16,
    }),
  },
};

export const ICON_SYMBOLS_BY_MODE: Record<HydrowayOperationalLayerMode, readonly string[]> = {
  operation: ['!', 'C', 'T'],
  navigation: ['D', 'M', 'B', '!'],
  logistics: ['T', 'C', 'Q'],
  risk: ['!', 'D', 'M'],
  government: ['G', 'M'],
};

const ICON_BADGE_BY_SYMBOL_LAYER: Record<string, string> = {
  [HYDRI_OP_ICON_LAYER_IDS.alertsIcon]: HYDRI_OP_ICON_LAYER_IDS.alertsIconBadge,
  [HYDRI_OP_ICON_LAYER_IDS.alertsCriticalIcon]: HYDRI_OP_ICON_LAYER_IDS.alertsCriticalIconBadge,
  [HYDRI_OP_ICON_LAYER_IDS.draftRestrictionIcon]: HYDRI_OP_ICON_LAYER_IDS.draftRestrictionIconBadge,
  [HYDRI_OP_ICON_LAYER_IDS.dredgingIcon]: HYDRI_OP_ICON_LAYER_IDS.dredgingIconBadge,
  [HYDRI_OP_ICON_LAYER_IDS.signalsIcon]: HYDRI_OP_ICON_LAYER_IDS.signalsIconBadge,
  [HYDRI_OP_ICON_LAYER_IDS.terminalsIcon]: HYDRI_OP_ICON_LAYER_IDS.terminalsIconBadge,
  [HYDRI_OP_ICON_LAYER_IDS.checkpointsIcon]: HYDRI_OP_ICON_LAYER_IDS.checkpointsIconBadge,
  [HYDRI_OP_ICON_LAYER_IDS.governmentIcon]: HYDRI_OP_ICON_LAYER_IDS.governmentIconBadge,
};

function toOpacityPaintConfig(visuals: OperationalModeVisualConfig): OperationalModePaintConfig {
  const iconKeys = new Set(Object.keys(HYDRI_OP_ICON_SYMBOL_LAYER_IDS));
  const labelKeys = new Set(['terminalsLabel', 'checkpointsLabel', 'planningAreasLabel']);
  const keys = Object.keys(HYDRI_OP_LAYER_IDS) as (keyof typeof HYDRI_OP_LAYER_IDS)[];
  const paint = {} as OperationalModePaintConfig;
  for (const key of keys) {
    if (labelKeys.has(key) || iconKeys.has(key)) {
      continue;
    }
    paint[key as OpLayerPaintKey] = visuals[key as OpLayerPaintKey].opacity;
  }
  paint.terminalsLabelVisibility = visuals.terminalsLabelVisibility;
  paint.checkpointsLabelVisibility = visuals.checkpointsLabelVisibility;
  paint.planningLabelVisibility = visuals.planningLabelVisibility;
  return paint;
}

const OPERATIONAL_MODE_PAINT: Record<HydrowayOperationalLayerMode, OperationalModePaintConfig> = {
  operation: toOpacityPaintConfig(OPERATIONAL_MODE_VISUALS.operation),
  navigation: toOpacityPaintConfig(OPERATIONAL_MODE_VISUALS.navigation),
  logistics: toOpacityPaintConfig(OPERATIONAL_MODE_VISUALS.logistics),
  risk: toOpacityPaintConfig(OPERATIONAL_MODE_VISUALS.risk),
  government: toOpacityPaintConfig(OPERATIONAL_MODE_VISUALS.government),
};

function zoomWidth(low: number, mid: number, high: number): ExpressionSpecification {
  return ['interpolate', ['linear'], ['zoom'], 4, low, 8, mid, 12, high];
}

function zoomTextSize(low: number, mid: number, high: number): ExpressionSpecification {
  return ['interpolate', ['linear'], ['zoom'], 4, low, 8, mid, 12, high];
}

function buildOperationalIconBadgeLayer(
  id: string,
  source: string,
  options: { filter?: FilterSpecification } = {},
): LayerSpecification {
  return {
    id,
    type: 'circle',
    source,
    filter: options.filter,
    paint: {
      'circle-color': ['get', 'iconColor'],
      'circle-radius': zoomWidth(8, 10, 12),
      'circle-opacity': 0.94,
      'circle-stroke-color': 'rgba(5, 16, 18, 0.94)',
      'circle-stroke-width': 2,
    },
  };
}

function buildOperationalIconSymbolLayer(
  id: string,
  source: string,
  options: {
    filter?: FilterSpecification;
    textSize?: number | ExpressionSpecification;
  } = {},
): LayerSpecification {
  return {
    id,
    type: 'symbol',
    source,
    filter: options.filter,
    layout: {
      ...HYDRI_MAPLIBRE_TEXT_FONT_LAYOUT,
      'text-field': ['get', 'iconSymbol'],
      'text-size': options.textSize ?? zoomTextSize(15, 18, 20),
      'text-anchor': 'center',
      'text-allow-overlap': true,
      'text-ignore-placement': true,
      'text-max-width': 8,
    },
    paint: {
      'text-color': '#FFFFFF',
      'text-halo-color': ['get', 'iconColor'],
      'text-halo-width': 3.2,
      'text-halo-blur': 0.15,
      'text-opacity': 1,
    },
  };
}

function buildOperationalIconLayerPair(
  symbolId: string,
  badgeId: string,
  source: string,
  options: {
    filter?: FilterSpecification;
    textSize?: number | ExpressionSpecification;
  } = {},
): LayerSpecification[] {
  return [
    buildOperationalIconBadgeLayer(badgeId, source, { filter: options.filter }),
    buildOperationalIconSymbolLayer(symbolId, source, options),
  ];
}

function emptyCollection(): GeoJSON.FeatureCollection {
  return EMPTY_FC;
}

function geoJsonSource(data: GeoJSON.FeatureCollection = emptyCollection()): SourceSpecification {
  return { type: 'geojson', data };
}

function resolveRouteInsertBeforeId(map: Map): string | undefined {
  if (layerExistsOnMap(map, HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeTrackCasing)) {
    return HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeTrackCasing;
  }
  return undefined;
}

function addLayerIfMissing(map: Map, layer: LayerSpecification, beforeId?: string): void {
  if (layerExistsOnMap(map, layer.id)) return;
  if (beforeId && layerExistsOnMap(map, beforeId)) {
    map.addLayer(layer, beforeId);
    return;
  }
  map.addLayer(layer);
}

function setSourceData(map: Map, sourceId: string, data: GeoJSON.FeatureCollection): void {
  const source = map.getSource(sourceId);
  if (source && 'setData' in source) {
    (source as GeoJSONSource).setData(data);
  }
}

function buildPlanningLabelPoints(
  slice: HydrowayOperationalDatasetSlice,
): GeoJSON.FeatureCollection<GeoJSON.Point> {
  const features: GeoJSON.Feature<GeoJSON.Point>[] = [];
  for (const area of slice.planningAreas) {
    const ring = area.coordinates[0];
    if (!ring?.length) continue;
    let lngSum = 0;
    let latSum = 0;
    let count = 0;
    for (const coord of ring) {
      if (coord.length < 2) continue;
      lngSum += coord[0];
      latSum += coord[1];
      count += 1;
    }
    if (!count) continue;
    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [lngSum / count, latSum / count] },
      properties: {
        id: area.id,
        name: area.name,
        type: area.type,
        status: area.status,
        tooltipKind: 'planning',
        institutionalSummary: area.institutionalSummary,
        iconSymbol: area.type === 'dredging-plan' ? 'M' : 'G',
        iconColor: area.type === 'concession-study' ? OP_GOV_PLANNING_ALT : OP_GOV_PRIMARY,
        iconKind: area.type === 'dredging-plan' ? 'dredging' : 'government',
      },
    });
  }
  return { type: 'FeatureCollection', features };
}

export function buildOperationalGeoJsonFromSlice(
  slice: HydrowayOperationalDatasetSlice | null,
): Record<keyof typeof HYDRI_OP_SOURCE_IDS, GeoJSON.FeatureCollection> {
  if (!slice) {
    return {
      corridors: emptyCollection(),
      segments: emptyCollection(),
      terminals: emptyCollection(),
      alerts: emptyCollection(),
      signals: emptyCollection(),
      planningAreas: emptyCollection(),
      planningLabels: emptyCollection(),
      checkpoints: emptyCollection(),
      segmentIcons: emptyCollection(),
    };
  }

  return {
    corridors: toCorridorsFeatureCollection([slice.corridor]),
    segments: toSegmentsFeatureCollection(slice.segments),
    terminals: toTerminalsFeatureCollection(slice.terminals),
    alerts: toAlertsFeatureCollection(slice.alerts),
    signals: toSignalsFeatureCollection(slice.signals),
    planningAreas: toPlanningAreasFeatureCollection(slice.planningAreas),
    planningLabels: buildPlanningLabelPoints(slice),
    checkpoints: toCheckpointsFeatureCollection(slice.checkpoints),
    segmentIcons: mergeAttentionIconPoints(
      slice.segments,
      slice.planningAreas,
      slice.alerts,
      slice.checkpoints,
    ),
  };
}

export function getHydrowayOperationalLayerDefinitions(): LayerSpecification[] {
  return [
    {
      id: HYDRI_OP_LAYER_IDS.planningAreasFill,
      type: 'fill',
      source: HYDRI_OP_SOURCE_IDS.planningAreas,
      paint: {
        'fill-color': [
          'match',
          ['get', 'type'],
          'concession-study',
          PLANNING_FILL_ALT,
          'dredging-plan',
          PLANNING_FILL_ALT,
          PLANNING_FILL,
        ],
        'fill-opacity': 0.14,
      },
    },
    {
      id: HYDRI_OP_LAYER_IDS.planningAreasOutline,
      type: 'line',
      source: HYDRI_OP_SOURCE_IDS.planningAreas,
      paint: {
        'line-color': PLANNING_OUTLINE,
        'line-width': zoomWidth(1, 1.6, 2.4),
        'line-opacity': 0.48,
      },
    },
    {
      id: HYDRI_OP_LAYER_IDS.corridorsShadow,
      type: 'line',
      source: HYDRI_OP_SOURCE_IDS.corridors,
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': 'rgba(6, 24, 36, 0.85)',
        'line-width': zoomWidth(5, 7, 9),
        'line-opacity': 0.22,
        'line-blur': 1.2,
      },
    },
    {
      id: HYDRI_OP_LAYER_IDS.corridorsCore,
      type: 'line',
      source: HYDRI_OP_SOURCE_IDS.corridors,
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': CORRIDOR_OPERATION,
        'line-width': zoomWidth(2.8, 4.2, 5.6),
        'line-opacity': 0.62,
      },
    },
    {
      id: HYDRI_OP_LAYER_IDS.corridorsHighlight,
      type: 'line',
      source: HYDRI_OP_SOURCE_IDS.corridors,
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': OP_OPERATION_SUPPORT,
        'line-width': zoomWidth(1.2, 1.8, 2.4),
        'line-opacity': 0.24,
      },
    },
    {
      id: HYDRI_OP_LAYER_IDS.segmentsNormal,
      type: 'line',
      source: HYDRI_OP_SOURCE_IDS.segments,
      filter: ['==', ['get', 'navigabilityStatus'], 'normal'],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': SEGMENT_COLORS.normal,
        'line-width': zoomWidth(2, 3.2, 4.4),
        'line-opacity': 0.72,
      },
    },
    {
      id: HYDRI_OP_LAYER_IDS.segmentsAttention,
      type: 'line',
      source: HYDRI_OP_SOURCE_IDS.segments,
      filter: ['==', ['get', 'navigabilityStatus'], 'attention'],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': SEGMENT_COLORS.attention,
        'line-width': zoomWidth(2.4, 3.8, 5),
        'line-opacity': 0.92,
      },
    },
    {
      id: HYDRI_OP_LAYER_IDS.segmentsRestricted,
      type: 'line',
      source: HYDRI_OP_SOURCE_IDS.segments,
      filter: ['==', ['get', 'navigabilityStatus'], 'restricted'],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': SEGMENT_COLORS.restricted,
        'line-width': zoomWidth(2.6, 4, 5.2),
        'line-opacity': 0.9,
      },
    },
    {
      id: HYDRI_OP_LAYER_IDS.segmentsDredging,
      type: 'line',
      source: HYDRI_OP_SOURCE_IDS.segments,
      filter: ['in', ['get', 'dredgingStatus'], ['literal', ['active', 'scheduled', 'restricted']]],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': SEGMENT_COLORS.dredging,
        'line-width': zoomWidth(2, 3.2, 4.2),
        'line-dasharray': [2, 1.5],
        'line-opacity': 0.88,
      },
    },
    {
      id: HYDRI_OP_LAYER_IDS.terminalsHalo,
      type: 'circle',
      source: HYDRI_OP_SOURCE_IDS.terminals,
      paint: {
        'circle-color': TERMINAL_LOGISTICS,
        'circle-radius': zoomWidth(8, 12, 16),
        'circle-opacity': 0.28,
        'circle-blur': 0.35,
      },
    },
    {
      id: HYDRI_OP_LAYER_IDS.terminalsPoint,
      type: 'circle',
      source: HYDRI_OP_SOURCE_IDS.terminals,
      paint: {
        'circle-color': TERMINAL_LOGISTICS,
        'circle-radius': zoomWidth(3.5, 5, 6.5),
        'circle-stroke-color': 'rgba(4, 16, 28, 0.9)',
        'circle-stroke-width': 1.2,
        'circle-opacity': 0.88,
      },
    },
    {
      id: HYDRI_OP_LAYER_IDS.terminalsLabel,
      type: 'symbol',
      source: HYDRI_OP_SOURCE_IDS.terminals,
      filter: FILTER_TERMINAL_LABEL,
      layout: {
        ...HYDRI_MAPLIBRE_TEXT_FONT_LAYOUT,
        'text-field': ['get', 'name'],
        'text-size': 11,
        'text-offset': [0, 1.4],
        'text-anchor': 'top',
        'text-max-width': 10,
      },
      paint: {
        'text-color': '#dff8ff',
        'text-halo-color': 'rgba(4, 12, 20, 0.85)',
        'text-halo-width': 1.2,
        'text-opacity': 0.9,
      },
    },
    {
      id: HYDRI_OP_LAYER_IDS.alertsHalo,
      type: 'circle',
      source: HYDRI_OP_SOURCE_IDS.alerts,
      paint: {
        'circle-color': [
          'match',
          ['get', 'severity'],
          'critical',
          ALERT_CRITICAL,
          'warning',
          ALERT_WARNING,
          'info',
          ALERT_INFO,
          ALERT_WARNING,
        ],
        'circle-radius': zoomWidth(10, 14, 18),
        'circle-opacity': 0.35,
        'circle-blur': 0.35,
      },
    },
    {
      id: HYDRI_OP_LAYER_IDS.alertsCriticalRing,
      type: 'circle',
      source: HYDRI_OP_SOURCE_IDS.alerts,
      filter: ['==', ['get', 'severity'], 'critical'],
      paint: {
        'circle-color': 'transparent',
        'circle-radius': zoomWidth(6, 8.5, 11),
        'circle-stroke-color': ALERT_CRITICAL,
        'circle-stroke-width': 2,
        'circle-opacity': 0.95,
      },
    },
    {
      id: HYDRI_OP_LAYER_IDS.alertsPoint,
      type: 'circle',
      source: HYDRI_OP_SOURCE_IDS.alerts,
      paint: {
        'circle-color': [
          'match',
          ['get', 'severity'],
          'critical',
          ALERT_CRITICAL,
          'warning',
          ALERT_WARNING,
          'info',
          ALERT_INFO,
          ALERT_WARNING,
        ],
        'circle-radius': zoomWidth(3.5, 5, 6),
        'circle-stroke-color': 'rgba(8, 18, 28, 0.9)',
        'circle-stroke-width': 1,
        'circle-opacity': 0.88,
      },
    },
    {
      id: HYDRI_OP_LAYER_IDS.signalsPoint,
      type: 'circle',
      source: HYDRI_OP_SOURCE_IDS.signals,
      filter: ['!=', ['get', 'condition'], 'attention'],
      paint: {
        'circle-color': SIGNAL_COLORS.ok,
        'circle-radius': zoomWidth(2.5, 3.5, 4.5),
        'circle-stroke-color': 'rgba(6, 18, 28, 0.85)',
        'circle-stroke-width': 0.8,
        'circle-opacity': 0.85,
      },
    },
    {
      id: HYDRI_OP_LAYER_IDS.signalsAttention,
      type: 'circle',
      source: HYDRI_OP_SOURCE_IDS.signals,
      filter: ['in', ['get', 'condition'], ['literal', ['attention', 'maintenance']]],
      paint: {
        'circle-color': SIGNAL_COLORS.attention,
        'circle-radius': zoomWidth(3.5, 5, 6),
        'circle-stroke-color': 'rgba(8, 18, 28, 0.9)',
        'circle-stroke-width': 1.2,
        'circle-opacity': 0.92,
      },
    },
    {
      id: HYDRI_OP_LAYER_IDS.checkpointsHalo,
      type: 'circle',
      source: HYDRI_OP_SOURCE_IDS.checkpoints,
      paint: {
        'circle-color': CHECKPOINT_HALO_OPERATION,
        'circle-radius': zoomWidth(7, 10, 13),
        'circle-opacity': 0.42,
        'circle-blur': 0.25,
      },
    },
    {
      id: HYDRI_OP_LAYER_IDS.checkpointsPoint,
      type: 'circle',
      source: HYDRI_OP_SOURCE_IDS.checkpoints,
      paint: {
        'circle-color': CHECKPOINT_OPERATION,
        'circle-radius': zoomWidth(3.2, 4.6, 5.8),
        'circle-stroke-color': 'rgba(4, 14, 24, 0.92)',
        'circle-stroke-width': 1.4,
        'circle-opacity': 0.92,
      },
    },
    {
      id: HYDRI_OP_LAYER_IDS.checkpointsLabel,
      type: 'symbol',
      source: HYDRI_OP_SOURCE_IDS.checkpoints,
      layout: {
        ...HYDRI_MAPLIBRE_TEXT_FONT_LAYOUT,
        'text-field': ['coalesce', ['get', 'label'], ['get', 'name']],
        'text-size': 10,
        'text-offset': [0, 1.3],
        'text-anchor': 'top',
        'text-max-width': 9,
      },
      paint: {
        'text-color': '#e8fff9',
        'text-halo-color': 'rgba(4, 12, 20, 0.9)',
        'text-halo-width': 1.1,
        'text-opacity': 0.88,
      },
    },
    {
      id: HYDRI_OP_LAYER_IDS.planningAreasLabel,
      type: 'symbol',
      source: HYDRI_OP_SOURCE_IDS.planningLabels,
      layout: {
        ...HYDRI_MAPLIBRE_TEXT_FONT_LAYOUT,
        'text-field': ['get', 'name'],
        'text-size': 10,
        'text-max-width': 12,
      },
      paint: {
        'text-color': 'rgba(210, 228, 248, 0.88)',
        'text-halo-color': 'rgba(4, 12, 22, 0.85)',
        'text-halo-width': 1,
        'text-opacity': 0.72,
      },
    },
    ...buildOperationalIconLayerPair(
      HYDRI_OP_ICON_LAYER_IDS.alertsIcon,
      HYDRI_OP_ICON_LAYER_IDS.alertsIconBadge,
      HYDRI_OP_SOURCE_IDS.alerts,
      { filter: FILTER_ALERT_NON_CRITICAL, textSize: zoomTextSize(15, 17, 19) },
    ),
    ...buildOperationalIconLayerPair(
      HYDRI_OP_ICON_LAYER_IDS.alertsCriticalIcon,
      HYDRI_OP_ICON_LAYER_IDS.alertsCriticalIconBadge,
      HYDRI_OP_SOURCE_IDS.alerts,
      { filter: FILTER_ALERT_CRITICAL, textSize: zoomTextSize(17, 19, 22) },
    ),
    ...buildOperationalIconLayerPair(
      HYDRI_OP_ICON_LAYER_IDS.draftRestrictionIcon,
      HYDRI_OP_ICON_LAYER_IDS.draftRestrictionIconBadge,
      HYDRI_OP_SOURCE_IDS.segmentIcons,
      { filter: FILTER_SEGMENT_DRAFT_ICON, textSize: zoomTextSize(16, 18, 20) },
    ),
    ...buildOperationalIconLayerPair(
      HYDRI_OP_ICON_LAYER_IDS.dredgingIcon,
      HYDRI_OP_ICON_LAYER_IDS.dredgingIconBadge,
      HYDRI_OP_SOURCE_IDS.segmentIcons,
      { filter: FILTER_SEGMENT_DREDGING_ICON, textSize: zoomTextSize(15, 17, 19) },
    ),
    ...buildOperationalIconLayerPair(
      HYDRI_OP_ICON_LAYER_IDS.signalsIcon,
      HYDRI_OP_ICON_LAYER_IDS.signalsIconBadge,
      HYDRI_OP_SOURCE_IDS.signals,
      { filter: FILTER_SIGNAL_ATTENTION_ICON, textSize: zoomTextSize(15, 17, 19) },
    ),
    ...buildOperationalIconLayerPair(
      HYDRI_OP_ICON_LAYER_IDS.terminalsIcon,
      HYDRI_OP_ICON_LAYER_IDS.terminalsIconBadge,
      HYDRI_OP_SOURCE_IDS.terminals,
      { textSize: zoomTextSize(16, 18, 20) },
    ),
    ...buildOperationalIconLayerPair(
      HYDRI_OP_ICON_LAYER_IDS.checkpointsIcon,
      HYDRI_OP_ICON_LAYER_IDS.checkpointsIconBadge,
      HYDRI_OP_SOURCE_IDS.checkpoints,
      { textSize: zoomTextSize(15, 17, 19) },
    ),
    ...buildOperationalIconLayerPair(
      HYDRI_OP_ICON_LAYER_IDS.governmentIcon,
      HYDRI_OP_ICON_LAYER_IDS.governmentIconBadge,
      HYDRI_OP_SOURCE_IDS.planningLabels,
      { textSize: zoomTextSize(15, 17, 19) },
    ),
  ];
}

export function ensureOperationalLayerSources(
  map: Map,
  data: Record<keyof typeof HYDRI_OP_SOURCE_IDS, GeoJSON.FeatureCollection>,
): Record<string, number> {
  const specs: Record<string, GeoJSON.FeatureCollection> = {
    [HYDRI_OP_SOURCE_IDS.corridors]: data.corridors,
    [HYDRI_OP_SOURCE_IDS.segments]: data.segments,
    [HYDRI_OP_SOURCE_IDS.terminals]: data.terminals,
    [HYDRI_OP_SOURCE_IDS.alerts]: data.alerts,
    [HYDRI_OP_SOURCE_IDS.signals]: data.signals,
    [HYDRI_OP_SOURCE_IDS.planningAreas]: data.planningAreas,
    [HYDRI_OP_SOURCE_IDS.planningLabels]: data.planningLabels,
    [HYDRI_OP_SOURCE_IDS.checkpoints]: data.checkpoints,
    [HYDRI_OP_SOURCE_IDS.segmentIcons]: data.segmentIcons,
  };

  const counts: Record<string, number> = {};

  for (const [id, collection] of Object.entries(specs)) {
    const safeCollection =
      collection?.type === 'FeatureCollection' && Array.isArray(collection.features)
        ? collection
        : emptyCollection();
    counts[id] = safeCollection.features.length;

    const existing = map.getSource(id);
    if (existing && 'setData' in existing) {
      (existing as GeoJSONSource).setData(safeCollection);
    } else if (!existing) {
      map.addSource(id, geoJsonSource(safeCollection));
    }
  }

  return counts;
}

export function ensureOperationalLayerLayers(map: Map): void {
  const beforeId = resolveRouteInsertBeforeId(map);
  for (const layer of getHydrowayOperationalLayerDefinitions()) {
    addLayerIfMissing(map, layer, beforeId);
  }
}

export function updateOperationalLayerData(
  map: Map,
  slice: HydrowayOperationalDatasetSlice | null,
): Record<string, number> {
  const data = buildOperationalGeoJsonFromSlice(slice);
  return ensureOperationalLayerSources(map, data);
}

const LINE_LAYER_VISUALS: Array<{ key: OpLayerPaintKey; layerId: string }> = [
  { key: 'corridorsShadow', layerId: HYDRI_OP_LAYER_IDS.corridorsShadow },
  { key: 'corridorsCore', layerId: HYDRI_OP_LAYER_IDS.corridorsCore },
  { key: 'corridorsHighlight', layerId: HYDRI_OP_LAYER_IDS.corridorsHighlight },
  { key: 'segmentsNormal', layerId: HYDRI_OP_LAYER_IDS.segmentsNormal },
  { key: 'segmentsAttention', layerId: HYDRI_OP_LAYER_IDS.segmentsAttention },
  { key: 'segmentsRestricted', layerId: HYDRI_OP_LAYER_IDS.segmentsRestricted },
  { key: 'segmentsDredging', layerId: HYDRI_OP_LAYER_IDS.segmentsDredging },
  { key: 'planningAreasOutline', layerId: HYDRI_OP_LAYER_IDS.planningAreasOutline },
];

const CIRCLE_LAYER_VISUALS: Array<{ key: OpLayerPaintKey; layerId: string }> = [
  { key: 'terminalsHalo', layerId: HYDRI_OP_LAYER_IDS.terminalsHalo },
  { key: 'terminalsPoint', layerId: HYDRI_OP_LAYER_IDS.terminalsPoint },
  { key: 'alertsHalo', layerId: HYDRI_OP_LAYER_IDS.alertsHalo },
  { key: 'alertsPoint', layerId: HYDRI_OP_LAYER_IDS.alertsPoint },
  { key: 'alertsCriticalRing', layerId: HYDRI_OP_LAYER_IDS.alertsCriticalRing },
  { key: 'signalsPoint', layerId: HYDRI_OP_LAYER_IDS.signalsPoint },
  { key: 'signalsAttention', layerId: HYDRI_OP_LAYER_IDS.signalsAttention },
  { key: 'checkpointsHalo', layerId: HYDRI_OP_LAYER_IDS.checkpointsHalo },
  { key: 'checkpointsPoint', layerId: HYDRI_OP_LAYER_IDS.checkpointsPoint },
];

function applyLayerFilter(
  map: Map,
  layerId: string,
  filter: FilterSpecification | null | undefined,
): void {
  if (!layerExistsOnMap(map, layerId)) return;
  try {
    if (filter) {
      map.setFilter(layerId, filter);
    } else {
      map.setFilter(layerId, null);
    }
  } catch {
    // Layer may be unavailable during style reload.
  }
}

function applyLineLayerVisual(map: Map, layerId: string, visual: OpLayerVisual): void {
  if (!layerExistsOnMap(map, layerId)) return;
  try {
    map.setLayoutProperty(layerId, 'visibility', visual.visibility);
    if (visual.filter !== undefined) {
      applyLayerFilter(map, layerId, visual.filter);
    }
    if (visual.visibility === 'none') return;
    map.setPaintProperty(layerId, 'line-opacity', visual.opacity);
    if (visual.lineWidth !== undefined) {
      map.setPaintProperty(layerId, 'line-width', visual.lineWidth);
    }
    if (visual.lineColor !== undefined) {
      map.setPaintProperty(layerId, 'line-color', visual.lineColor);
    }
    if (visual.lineDasharray !== undefined) {
      map.setPaintProperty(layerId, 'line-dasharray', visual.lineDasharray);
    } else {
      map.setPaintProperty(layerId, 'line-dasharray', undefined);
    }
  } catch {
    // Layer may be unavailable during style reload.
  }
}

function applyCircleLayerVisual(map: Map, layerId: string, visual: OpLayerVisual): void {
  if (!layerExistsOnMap(map, layerId)) return;
  try {
    map.setLayoutProperty(layerId, 'visibility', visual.visibility);
    if (visual.filter !== undefined) {
      applyLayerFilter(map, layerId, visual.filter);
    }
    if (visual.visibility === 'none') return;
    map.setPaintProperty(layerId, 'circle-opacity', visual.opacity);
    if (visual.circleRadius !== undefined) {
      map.setPaintProperty(layerId, 'circle-radius', visual.circleRadius);
    }
    if (visual.circleColor !== undefined) {
      map.setPaintProperty(layerId, 'circle-color', visual.circleColor);
    }
    if (visual.circleStrokeColor !== undefined) {
      map.setPaintProperty(layerId, 'circle-stroke-color', visual.circleStrokeColor);
    }
    if (visual.circleStrokeWidth !== undefined) {
      map.setPaintProperty(layerId, 'circle-stroke-width', visual.circleStrokeWidth);
    }
  } catch {
    // Layer may be unavailable during style reload.
  }
}

function applyFillLayerVisual(map: Map, layerId: string, visual: OpLayerVisual): void {
  if (!layerExistsOnMap(map, layerId)) return;
  try {
    map.setLayoutProperty(layerId, 'visibility', visual.visibility);
    if (visual.filter !== undefined) {
      applyLayerFilter(map, layerId, visual.filter);
    }
    if (visual.visibility === 'none') return;
    map.setPaintProperty(layerId, 'fill-opacity', visual.opacity);
    if (visual.fillColor !== undefined) {
      map.setPaintProperty(layerId, 'fill-color', visual.fillColor);
    }
  } catch {
    // Layer may be unavailable during style reload.
  }
}

const ICON_LAYER_VISUALS: Array<{ key: OpIconLayerKey; layerId: string }> = (
  Object.entries(HYDRI_OP_ICON_SYMBOL_LAYER_IDS) as [OpIconLayerKey, string][]
).map(([key, layerId]) => ({ key, layerId }));

function applyIconBadgeVisual(map: Map, layerId: string, visual: OpIconVisual): void {
  if (!layerExistsOnMap(map, layerId)) return;
  try {
    map.setLayoutProperty(layerId, 'visibility', visual.visibility);
    if (visual.filter !== undefined) {
      applyLayerFilter(map, layerId, visual.filter);
    }
    if (visual.visibility === 'none') return;
    map.setPaintProperty(layerId, 'circle-opacity', Math.min(visual.opacity, 0.96));
  } catch {
    // Layer may be unavailable during style reload.
  }
}

function applySymbolLayerVisual(map: Map, layerId: string, visual: OpIconVisual): void {
  if (!layerExistsOnMap(map, layerId)) return;
  try {
    map.setLayoutProperty(layerId, 'visibility', visual.visibility);
    if (visual.filter !== undefined) {
      applyLayerFilter(map, layerId, visual.filter);
    }
    if (visual.visibility === 'none') return;
    map.setPaintProperty(layerId, 'text-opacity', visual.opacity);
    if (visual.textSize !== undefined) {
      map.setLayoutProperty(layerId, 'text-size', visual.textSize);
    }
  } catch {
    // Layer may be unavailable during style reload.
  }
}

function syncOperationalIconLayerPaint(map: Map, mode: HydrowayOperationalLayerMode): void {
  const iconVisuals = OPERATIONAL_MODE_ICON_VISUALS[mode];
  if (!iconVisuals) return;
  for (const entry of ICON_LAYER_VISUALS) {
    const visual = iconVisuals[entry.key];
    const badgeLayerId = ICON_BADGE_BY_SYMBOL_LAYER[entry.layerId];
    if (badgeLayerId) {
      applyIconBadgeVisual(map, badgeLayerId, visual);
    }
    applySymbolLayerVisual(map, entry.layerId, visual);
  }
}

export function syncOperationalLayerModePaint(
  map: Map,
  mode: HydrowayOperationalLayerMode,
): void {
  const visuals = OPERATIONAL_MODE_VISUALS[mode];
  if (!visuals) return;

  for (const entry of LINE_LAYER_VISUALS) {
    applyLineLayerVisual(map, entry.layerId, visuals[entry.key]);
  }

  for (const entry of CIRCLE_LAYER_VISUALS) {
    applyCircleLayerVisual(map, entry.layerId, visuals[entry.key]);
  }

  applyFillLayerVisual(map, HYDRI_OP_LAYER_IDS.planningAreasFill, visuals.planningAreasFill);

  const labelLayers: Array<{ id: string; visibility: 'visible' | 'none'; opacityKey: OpLayerPaintKey }> = [
    {
      id: HYDRI_OP_LAYER_IDS.terminalsLabel,
      visibility: visuals.terminalsLabelVisibility,
      opacityKey: 'terminalsPoint',
    },
    {
      id: HYDRI_OP_LAYER_IDS.checkpointsLabel,
      visibility: visuals.checkpointsLabelVisibility,
      opacityKey: 'checkpointsPoint',
    },
    {
      id: HYDRI_OP_LAYER_IDS.planningAreasLabel,
      visibility: visuals.planningLabelVisibility,
      opacityKey: 'planningAreasFill',
    },
  ];

  for (const entry of labelLayers) {
    if (!layerExistsOnMap(map, entry.id)) continue;
    try {
      map.setLayoutProperty(entry.id, 'visibility', entry.visibility);
      if (entry.visibility === 'visible') {
        const opacity = visuals[entry.opacityKey].opacity;
        map.setPaintProperty(entry.id, 'text-opacity', opacity > 0 ? 0.88 : 0);
      }
    } catch {
      // Best-effort during teardown.
    }
  }

  syncOperationalIconLayerPaint(map, mode);
}

export function listOperationalLayerIdsOnMap(map: Map): {
  layerIdsFound: string[];
  missingLayerIds: string[];
} {
  const allLayerIds = [
    ...new Set([...Object.values(HYDRI_OP_LAYER_IDS), ...Object.values(HYDRI_OP_ICON_LAYER_IDS)]),
  ];
  const layerIdsFound = allLayerIds.filter((layerId) => layerExistsOnMap(map, layerId));
  const missingLayerIds = allLayerIds.filter((layerId) => !layerExistsOnMap(map, layerId));
  return { layerIdsFound, missingLayerIds };
}

export function syncOperationalLayers(
  map: Map,
  slice: HydrowayOperationalDatasetSlice | null,
  mode: HydrowayOperationalLayerMode,
): Record<string, number> {
  ensureOperationalLayerLayers(map);
  const sourceCounts = updateOperationalLayerData(map, slice);
  syncOperationalLayerModePaint(map, mode);
  return sourceCounts;
}

export type OperationalSourceCountsLog = {
  cargoId: string;
  corridorsCount: number;
  segmentsCount: number;
  terminalsCount: number;
  alertsCount: number;
  signalsCount: number;
  planningAreasCount: number;
  checkpointsCount: number;
};

export function formatOperationalSourceCountsForLog(
  cargoId: string,
  sourceCounts: Record<string, number>,
): OperationalSourceCountsLog {
  return {
    cargoId,
    corridorsCount: sourceCounts[HYDRI_OP_SOURCE_IDS.corridors] ?? 0,
    segmentsCount: sourceCounts[HYDRI_OP_SOURCE_IDS.segments] ?? 0,
    terminalsCount: sourceCounts[HYDRI_OP_SOURCE_IDS.terminals] ?? 0,
    alertsCount: sourceCounts[HYDRI_OP_SOURCE_IDS.alerts] ?? 0,
    signalsCount: sourceCounts[HYDRI_OP_SOURCE_IDS.signals] ?? 0,
    planningAreasCount: sourceCounts[HYDRI_OP_SOURCE_IDS.planningAreas] ?? 0,
    checkpointsCount: sourceCounts[HYDRI_OP_SOURCE_IDS.checkpoints] ?? 0,
  };
}

export function countOperationalSourceFeatures(
  slice: HydrowayOperationalDatasetSlice | null,
): Record<string, number> {
  if (!slice) {
    return Object.fromEntries(Object.values(HYDRI_OP_SOURCE_IDS).map((id) => [id, 0]));
  }
  return {
    [HYDRI_OP_SOURCE_IDS.corridors]: 1,
    [HYDRI_OP_SOURCE_IDS.segments]: slice.segments.length,
    [HYDRI_OP_SOURCE_IDS.terminals]: slice.terminals.length,
    [HYDRI_OP_SOURCE_IDS.alerts]: slice.alerts.length,
    [HYDRI_OP_SOURCE_IDS.signals]: slice.signals.length,
    [HYDRI_OP_SOURCE_IDS.planningAreas]: slice.planningAreas.length,
    [HYDRI_OP_SOURCE_IDS.planningLabels]: slice.planningAreas.length,
    [HYDRI_OP_SOURCE_IDS.checkpoints]: slice.checkpoints.length,
    [HYDRI_OP_SOURCE_IDS.segmentIcons]: mergeAttentionIconPoints(
      slice.segments,
      slice.planningAreas,
      slice.alerts,
      slice.checkpoints,
    ).features.length,
  };
}

export function buildIconFeatureCounts(
  slice: HydrowayOperationalDatasetSlice | null,
): Record<string, number> {
  if (!slice) {
    return { alerts: 0, terminals: 0, signals: 0, checkpoints: 0, government: 0, segmentIcons: 0 };
  }
  const segmentIcons = mergeAttentionIconPoints(
    slice.segments,
    slice.planningAreas,
    slice.alerts,
    slice.checkpoints,
  );
  const governmentIcons = slice.planningAreas.filter((area) => area.type !== 'dredging-plan').length;
  return {
    alerts: slice.alerts.length,
    terminals: slice.terminals.length,
    signals: slice.signals.filter(
      (signal) => signal.condition === 'attention' || signal.condition === 'maintenance',
    ).length,
    checkpoints: slice.checkpoints.length,
    government: governmentIcons,
    segmentIcons: segmentIcons.features.length,
  };
}

export function listVisibleIconLayerIds(
  map: Map,
  mode: HydrowayOperationalLayerMode,
): string[] {
  const iconVisuals = OPERATIONAL_MODE_ICON_VISUALS[mode];
  return ICON_LAYER_VISUALS.filter((entry) => iconVisuals[entry.key].opacity > 0.02)
    .map((entry) => entry.layerId)
    .filter((layerId) => {
      if (!layerExistsOnMap(map, layerId)) return false;
      try {
        return map.getLayoutProperty(layerId, 'visibility') !== 'none';
      } catch {
        return false;
      }
    });
}

export function listVisibleOperationalLayerIds(
  map: Map,
  mode: HydrowayOperationalLayerMode,
): string[] {
  const paint = OPERATIONAL_MODE_PAINT[mode];
  return (Object.entries(HYDRI_OP_LAYER_IDS) as [OpLayerPaintKey, string][])
    .filter(([key]) => {
      const value = paint[key];
      return typeof value === 'number' ? value > 0.02 : value === 'visible';
    })
    .map(([, layerId]) => layerId)
    .filter((layerId) => {
      if (!layerExistsOnMap(map, layerId)) return false;
      try {
        return map.getLayoutProperty(layerId, 'visibility') !== 'none';
      } catch {
        return false;
      }
    });
}

export function listHiddenOperationalLayerIds(map: Map): string[] {
  const allLayerIds = [
    ...new Set([...Object.values(HYDRI_OP_LAYER_IDS), ...Object.values(HYDRI_OP_ICON_LAYER_IDS)]),
  ];
  return allLayerIds.filter((layerId) => {
    if (!layerExistsOnMap(map, layerId)) return false;
    try {
      return map.getLayoutProperty(layerId, 'visibility') === 'none';
    } catch {
      return false;
    }
  });
}

export function buildOperationalModePaintSnapshot(
  mode: HydrowayOperationalLayerMode,
  map?: Map | null,
): Record<string, unknown> {
  const visuals = OPERATIONAL_MODE_VISUALS[mode];

  const readLinePaint = (layerId: string, key: OpLayerPaintKey) => {
    const visual = visuals[key];
    const snapshot: Record<string, unknown> = {
      visibility: visual.visibility,
      opacity: visual.opacity,
      width: visual.lineWidth ?? null,
      color: visual.lineColor ?? null,
    };
    if (map && layerExistsOnMap(map, layerId)) {
      try {
        snapshot.opacity = map.getPaintProperty(layerId, 'line-opacity');
        snapshot.width = map.getPaintProperty(layerId, 'line-width');
        snapshot.color = map.getPaintProperty(layerId, 'line-color');
        snapshot.visibility = map.getLayoutProperty(layerId, 'visibility');
      } catch {
        // Best-effort during style reload.
      }
    }
    return snapshot;
  };

  const readCirclePaint = (layerId: string, key: OpLayerPaintKey) => {
    const visual = visuals[key];
    const snapshot: Record<string, unknown> = {
      visibility: visual.visibility,
      opacity: visual.opacity,
      radius: visual.circleRadius ?? null,
      color: visual.circleColor ?? null,
    };
    if (map && layerExistsOnMap(map, layerId)) {
      try {
        snapshot.opacity = map.getPaintProperty(layerId, 'circle-opacity');
        snapshot.radius = map.getPaintProperty(layerId, 'circle-radius');
        snapshot.color = map.getPaintProperty(layerId, 'circle-color');
        snapshot.visibility = map.getLayoutProperty(layerId, 'visibility');
      } catch {
        // Best-effort during style reload.
      }
    }
    return snapshot;
  };

  const readFillPaint = (layerId: string, key: OpLayerPaintKey) => {
    const visual = visuals[key];
    const snapshot: Record<string, unknown> = {
      visibility: visual.visibility,
      opacity: visual.opacity,
      color: visual.fillColor ?? null,
    };
    if (map && layerExistsOnMap(map, layerId)) {
      try {
        snapshot.opacity = map.getPaintProperty(layerId, 'fill-opacity');
        snapshot.color = map.getPaintProperty(layerId, 'fill-color');
        snapshot.visibility = map.getLayoutProperty(layerId, 'visibility');
      } catch {
        // Best-effort during style reload.
      }
    }
    return snapshot;
  };

  return {
    dominantColors: OPERATIONAL_MODE_DOMINANT_COLORS[mode],
    corridors: readLinePaint(HYDRI_OP_LAYER_IDS.corridorsCore, 'corridorsCore'),
    segmentsNormal: readLinePaint(HYDRI_OP_LAYER_IDS.segmentsNormal, 'segmentsNormal'),
    segmentsAttention: readLinePaint(HYDRI_OP_LAYER_IDS.segmentsAttention, 'segmentsAttention'),
    segmentsRestricted: readLinePaint(HYDRI_OP_LAYER_IDS.segmentsRestricted, 'segmentsRestricted'),
    segmentsDredging: readLinePaint(HYDRI_OP_LAYER_IDS.segmentsDredging, 'segmentsDredging'),
    terminals: readCirclePaint(HYDRI_OP_LAYER_IDS.terminalsPoint, 'terminalsPoint'),
    alerts: readCirclePaint(HYDRI_OP_LAYER_IDS.alertsPoint, 'alertsPoint'),
    alertsCriticalRing: readCirclePaint(HYDRI_OP_LAYER_IDS.alertsCriticalRing, 'alertsCriticalRing'),
    planningFill: readFillPaint(HYDRI_OP_LAYER_IDS.planningAreasFill, 'planningAreasFill'),
    planningOutline: readLinePaint(HYDRI_OP_LAYER_IDS.planningAreasOutline, 'planningAreasOutline'),
    checkpoints: readCirclePaint(HYDRI_OP_LAYER_IDS.checkpointsPoint, 'checkpointsPoint'),
  };
}

export function buildOperationalLayersDebugSnapshot(
  map: Map,
  mode: HydrowayOperationalLayerMode,
  cargoId: string,
  slice: HydrowayOperationalDatasetSlice | null,
): {
  currentMode: HydrowayOperationalLayerMode;
  cargoId: string;
  sourceCounts: Record<string, number>;
  existingLayerIds: string[];
  visibleLayerIds: string[];
  hiddenLayerIds: string[];
  missingLayerIds: string[];
  modePaintSnapshot: Record<string, unknown>;
  activeLegend: typeof OPERATIONAL_MODE_LEGEND[HydrowayOperationalLayerMode];
  visibleIconLayerIds: string[];
  iconFeatureCounts: Record<string, number>;
  iconSymbolsByMode: readonly string[];
} {
  const { layerIdsFound, missingLayerIds } = listOperationalLayerIdsOnMap(map);
  return {
    currentMode: mode,
    cargoId,
    sourceCounts: countOperationalSourceFeatures(slice),
    existingLayerIds: layerIdsFound,
    visibleLayerIds: listVisibleOperationalLayerIds(map, mode),
    hiddenLayerIds: listHiddenOperationalLayerIds(map),
    missingLayerIds,
    modePaintSnapshot: buildOperationalModePaintSnapshot(mode, map),
    activeLegend: OPERATIONAL_MODE_LEGEND[mode],
    visibleIconLayerIds: listVisibleIconLayerIds(map, mode),
    iconFeatureCounts: buildIconFeatureCounts(slice),
    iconSymbolsByMode: ICON_SYMBOLS_BY_MODE[mode],
  };
}

export function getOperationalModePaintConfig(
  mode: HydrowayOperationalLayerMode,
): OperationalModePaintConfig {
  return OPERATIONAL_MODE_PAINT[mode];
}

/** Layers interativas para tooltip operacional (pontos apenas). */
export const HYDRI_OP_TOOLTIP_LAYER_IDS = [
  HYDRI_OP_LAYER_IDS.terminalsPoint,
  HYDRI_OP_LAYER_IDS.alertsPoint,
  HYDRI_OP_LAYER_IDS.signalsPoint,
  HYDRI_OP_LAYER_IDS.signalsAttention,
  HYDRI_OP_LAYER_IDS.checkpointsPoint,
  HYDRI_OP_LAYER_IDS.planningAreasLabel,
] as const;

declare global {
  interface Window {
    __hydriOperationalLayersDebug?: () => ReturnType<typeof buildOperationalLayersDebugSnapshot>;
  }
}

export {};
