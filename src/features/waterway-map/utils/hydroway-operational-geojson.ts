import type {
  HydrowayAlert,
  HydrowayCheckpoint,
  HydrowayCorridor,
  HydrowayLngLat,
  HydrowayPlanningArea,
  HydrowaySegment,
  HydrowaySignal,
  HydrowayTerminal,
} from '../domain/hydroway-operational-domain.types';
import { isValidLineStringCoordinates, isValidLngLat } from './hydroway-operational-validation';

export const OP_ICON_COLORS = {
  critical: '#FF3B30',
  riskDominant: '#FF2D55',
  warning: '#FFB020',
  restricted: '#EF4444',
  dredging: '#2563EB',
  signalAttention: '#F59E0B',
  terminal: '#8B5CF6',
  checkpoint: '#38BDF8',
  bottleneck: '#F97316',
  government: '#2563EB',
  governmentAlt: '#A855F7',
} as const;

export type OperationalIconProperties = {
  iconSymbol: string;
  iconColor: string;
  iconKind?: string;
};

function resolveAlertIcon(alert: HydrowayAlert): OperationalIconProperties {
  if (alert.type === 'port-window' || alert.type === 'traffic') {
    return { iconSymbol: 'Q', iconColor: OP_ICON_COLORS.bottleneck, iconKind: 'bottleneck' };
  }
  if (alert.type === 'draft') {
    return { iconSymbol: 'D', iconColor: OP_ICON_COLORS.restricted, iconKind: 'draft-restriction' };
  }
  if (alert.type === 'dredging') {
    return { iconSymbol: 'M', iconColor: OP_ICON_COLORS.dredging, iconKind: 'dredging' };
  }
  if (alert.severity === 'critical') {
    return { iconSymbol: '!', iconColor: OP_ICON_COLORS.riskDominant, iconKind: 'alert-critical' };
  }
  if (alert.severity === 'warning') {
    return { iconSymbol: '!', iconColor: OP_ICON_COLORS.warning, iconKind: 'alert-warning' };
  }
  return { iconSymbol: '!', iconColor: OP_ICON_COLORS.warning, iconKind: 'alert-info' };
}

function resolveTerminalIcon(terminal: HydrowayTerminal): OperationalIconProperties {
  if (terminal.queueRisk === 'high') {
    return { iconSymbol: 'Q', iconColor: OP_ICON_COLORS.bottleneck, iconKind: 'bottleneck' };
  }
  return { iconSymbol: 'T', iconColor: OP_ICON_COLORS.terminal, iconKind: 'terminal' };
}

function resolveSignalIcon(signal: HydrowaySignal): OperationalIconProperties {
  if (signal.condition === 'attention' || signal.condition === 'maintenance') {
    return { iconSymbol: 'B', iconColor: OP_ICON_COLORS.signalAttention, iconKind: 'signal-attention' };
  }
  return { iconSymbol: 'B', iconColor: OP_ICON_COLORS.signalAttention, iconKind: 'signal-ok' };
}

function resolveCheckpointIcon(checkpoint: HydrowayCheckpoint): OperationalIconProperties {
  if (checkpoint.type === 'risk-point') {
    return { iconSymbol: 'D', iconColor: OP_ICON_COLORS.restricted, iconKind: 'draft-restriction' };
  }
  return { iconSymbol: 'C', iconColor: OP_ICON_COLORS.checkpoint, iconKind: 'checkpoint' };
}

function resolvePlanningIcon(area: HydrowayPlanningArea): OperationalIconProperties {
  if (area.type === 'dredging-plan') {
    return { iconSymbol: 'M', iconColor: OP_ICON_COLORS.dredging, iconKind: 'dredging' };
  }
  const isStudy = area.type === 'concession-study' || area.type === 'priority-corridor';
  return {
    iconSymbol: 'G',
    iconColor: isStudy ? OP_ICON_COLORS.governmentAlt : OP_ICON_COLORS.government,
    iconKind: 'government',
  };
}

function resolveSegmentIcon(segment: HydrowaySegment): OperationalIconProperties | null {
  if (
    segment.dredgingStatus === 'active' ||
    segment.dredgingStatus === 'scheduled' ||
    segment.dredgingStatus === 'restricted'
  ) {
    return { iconSymbol: 'M', iconColor: OP_ICON_COLORS.dredging, iconKind: 'dredging' };
  }
  if (segment.navigabilityStatus === 'restricted' || segment.navigabilityStatus === 'attention') {
    return { iconSymbol: 'D', iconColor: OP_ICON_COLORS.restricted, iconKind: 'draft-restriction' };
  }
  return null;
}

function midpointOfLine(coordinates: HydrowayLngLat[]): HydrowayLngLat | null {
  if (!coordinates.length) return null;
  const index = Math.floor(coordinates.length / 2);
  return coordinates[index] ?? null;
}

type GeoJsonFeatureCollection<G extends GeoJSON.Geometry> = GeoJSON.FeatureCollection<G>;

function emptyFeatureCollection<G extends GeoJSON.Geometry>(): GeoJsonFeatureCollection<G> {
  return { type: 'FeatureCollection', features: [] };
}

function pickSegmentProperties(segment: HydrowaySegment): Record<string, unknown> {
  return {
    id: segment.id,
    corridorId: segment.corridorId,
    name: segment.name,
    navigabilityStatus: segment.navigabilityStatus,
    waterLevelStatus: segment.waterLevelStatus,
    droughtRisk: segment.droughtRisk,
    dredgingStatus: segment.dredgingStatus,
    speedRecommendation: segment.speedRecommendation,
    businessImpactSummary: segment.businessImpactSummary,
    draftMeters: segment.draftMeters ?? undefined,
    requiredDraftMeters: segment.requiredDraftMeters ?? undefined,
  };
}

function pickTerminalProperties(terminal: HydrowayTerminal): Record<string, unknown> {
  const icon = resolveTerminalIcon(terminal);
  return {
    tooltipKind: 'terminal',
    id: terminal.id,
    name: terminal.name,
    type: terminal.type,
    operationalStatus: terminal.operationalStatus,
    queueRisk: terminal.queueRisk,
    etaRelevance: terminal.etaRelevance,
    importance: terminal.importance,
    businessImpactSummary: terminal.businessImpactSummary,
    iconSymbol: icon.iconSymbol,
    iconColor: icon.iconColor,
    iconKind: icon.iconKind,
  };
}

function pickAlertProperties(alert: HydrowayAlert): Record<string, unknown> {
  const icon = resolveAlertIcon(alert);
  return {
    tooltipKind: 'alert',
    id: alert.id,
    type: alert.type,
    severity: alert.severity,
    title: alert.title,
    shortMessage: alert.shortMessage,
    impact: alert.impact,
    recommendedAction: alert.recommendedAction,
    audience: alert.audience,
    segmentId: alert.segmentId,
    corridorId: alert.corridorId,
    etaImpactMinutes: alert.etaImpactMinutes ?? undefined,
    iconSymbol: icon.iconSymbol,
    iconColor: icon.iconColor,
    iconKind: icon.iconKind,
  };
}

function pickSignalProperties(signal: HydrowaySignal): Record<string, unknown> {
  const icon = resolveSignalIcon(signal);
  return {
    tooltipKind: 'signal',
    id: signal.id,
    segmentId: signal.segmentId,
    signalType: signal.signalType,
    condition: signal.condition,
    visibilityPriority: signal.visibilityPriority,
    captainHint: signal.captainHint,
    iconSymbol: icon.iconSymbol,
    iconColor: icon.iconColor,
    iconKind: icon.iconKind,
  };
}

function pickCheckpointProperties(checkpoint: HydrowayCheckpoint): Record<string, unknown> {
  const icon = resolveCheckpointIcon(checkpoint);
  return {
    tooltipKind: 'checkpoint',
    id: checkpoint.id,
    name: checkpoint.name,
    type: checkpoint.type,
    status: checkpoint.status,
    label: checkpoint.label,
    shortMessage: checkpoint.shortMessage,
    cargoId: checkpoint.cargoId,
    terminalId: checkpoint.terminalId,
    alertId: checkpoint.alertId,
    iconSymbol: icon.iconSymbol,
    iconColor: icon.iconColor,
    iconKind: icon.iconKind,
  };
}

function pickCorridorProperties(corridor: HydrowayCorridor): Record<string, unknown> {
  return {
    id: corridor.id,
    name: corridor.name,
    officialCode: corridor.officialCode,
    region: corridor.region,
    priority: corridor.priority,
    concessionStatus: corridor.concessionStatus,
    strategicRole: corridor.strategicRole,
    businessValue: corridor.businessValue,
    cargoProfiles: corridor.cargoProfiles,
    sourceContext: corridor.sourceContext,
  };
}

function pickPlanningAreaProperties(area: HydrowayPlanningArea): Record<string, unknown> {
  const icon = resolvePlanningIcon(area);
  return {
    id: area.id,
    name: area.name,
    type: area.type,
    status: area.status,
    confidence: area.confidence,
    institutionalSummary: area.institutionalSummary,
    authority: area.authority,
    sourceName: area.sourceName,
    iconSymbol: icon.iconSymbol,
    iconColor: icon.iconColor,
    iconKind: icon.iconKind,
  };
}

export function toCorridorsFeatureCollection(
  corridors: HydrowayCorridor[],
): GeoJsonFeatureCollection<GeoJSON.LineString> {
  if (!corridors.length) return emptyFeatureCollection();

  const features: GeoJSON.Feature<GeoJSON.LineString>[] = [];
  for (const corridor of corridors) {
    if (!isValidLineStringCoordinates(corridor.coordinates)) continue;
    features.push({
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: corridor.coordinates },
      properties: pickCorridorProperties(corridor),
    });
  }
  return { type: 'FeatureCollection', features };
}

export function toSegmentsFeatureCollection(
  segments: HydrowaySegment[],
): GeoJsonFeatureCollection<GeoJSON.LineString> {
  if (!segments.length) return emptyFeatureCollection();

  const features: GeoJSON.Feature<GeoJSON.LineString>[] = [];
  for (const segment of segments) {
    if (!isValidLineStringCoordinates(segment.coordinates)) continue;
    features.push({
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: segment.coordinates },
      properties: pickSegmentProperties(segment),
    });
  }
  return { type: 'FeatureCollection', features };
}

export function toTerminalsFeatureCollection(
  terminals: HydrowayTerminal[],
): GeoJsonFeatureCollection<GeoJSON.Point> {
  if (!terminals.length) return emptyFeatureCollection();

  const features: GeoJSON.Feature<GeoJSON.Point>[] = [];
  for (const terminal of terminals) {
    if (!isValidLngLat(terminal.coordinates)) continue;
    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: terminal.coordinates },
      properties: pickTerminalProperties(terminal),
    });
  }
  return { type: 'FeatureCollection', features };
}

export function toAlertsFeatureCollection(
  alerts: HydrowayAlert[],
): GeoJsonFeatureCollection<GeoJSON.Point> {
  if (!alerts.length) return emptyFeatureCollection();

  const features: GeoJSON.Feature<GeoJSON.Point>[] = [];
  for (const alert of alerts) {
    if (!isValidLngLat(alert.coordinates)) continue;
    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: alert.coordinates },
      properties: pickAlertProperties(alert),
    });
  }
  return { type: 'FeatureCollection', features };
}

export function toSignalsFeatureCollection(
  signals: HydrowaySignal[],
): GeoJsonFeatureCollection<GeoJSON.Point> {
  if (!signals.length) return emptyFeatureCollection();

  const features: GeoJSON.Feature<GeoJSON.Point>[] = [];
  for (const signal of signals) {
    if (!isValidLngLat(signal.coordinates)) continue;
    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: signal.coordinates },
      properties: pickSignalProperties(signal),
    });
  }
  return { type: 'FeatureCollection', features };
}

function ringToPolygonCoordinates(ring: HydrowayLngLat[]): HydrowayLngLat[] | null {
  if (!isValidLineStringCoordinates(ring) || ring.length < 3) return null;
  const first = ring[0];
  const last = ring[ring.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    return [...ring, first];
  }
  return ring;
}

export function toPlanningAreasFeatureCollection(
  areas: HydrowayPlanningArea[],
): GeoJsonFeatureCollection<GeoJSON.Polygon> {
  if (!areas.length) return emptyFeatureCollection();

  const features: GeoJSON.Feature<GeoJSON.Polygon>[] = [];
  for (const area of areas) {
    const rings = area.coordinates
      .map((ring) => ringToPolygonCoordinates(ring))
      .filter((ring): ring is HydrowayLngLat[] => ring !== null);
    if (!rings.length) continue;
    features.push({
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: rings },
      properties: pickPlanningAreaProperties(area),
    });
  }
  return { type: 'FeatureCollection', features };
}

export function toCheckpointsFeatureCollection(
  checkpoints: HydrowayCheckpoint[],
): GeoJsonFeatureCollection<GeoJSON.Point> {
  if (!checkpoints.length) return emptyFeatureCollection();

  const features: GeoJSON.Feature<GeoJSON.Point>[] = [];
  for (const checkpoint of checkpoints) {
    if (!isValidLngLat(checkpoint.coordinates)) continue;
    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: checkpoint.coordinates },
      properties: pickCheckpointProperties(checkpoint),
    });
  }
  return { type: 'FeatureCollection', features };
}

export function toSegmentIconsFeatureCollection(
  segments: HydrowaySegment[],
): GeoJsonFeatureCollection<GeoJSON.Point> {
  if (!segments.length) return emptyFeatureCollection();

  const features: GeoJSON.Feature<GeoJSON.Point>[] = [];
  for (const segment of segments) {
    const icon = resolveSegmentIcon(segment);
    const midpoint = midpointOfLine(segment.coordinates);
    if (!icon || !midpoint || !isValidLngLat(midpoint)) continue;
    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: midpoint },
      properties: {
        id: `${segment.id}-icon`,
        segmentId: segment.id,
        name: segment.name,
        navigabilityStatus: segment.navigabilityStatus,
        dredgingStatus: segment.dredgingStatus,
        iconSymbol: icon.iconSymbol,
        iconColor: icon.iconColor,
        iconKind: icon.iconKind,
      },
    });
  }
  return { type: 'FeatureCollection', features };
}

export function toPlanningDredgingIconsFeatureCollection(
  areas: HydrowayPlanningArea[],
): GeoJsonFeatureCollection<GeoJSON.Point> {
  const features: GeoJSON.Feature<GeoJSON.Point>[] = [];
  for (const area of areas) {
    if (area.type !== 'dredging-plan') continue;
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
    const icon = resolvePlanningIcon(area);
    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [lngSum / count, latSum / count] },
      properties: {
        id: `${area.id}-dredging-icon`,
        name: area.name,
        type: area.type,
        iconSymbol: icon.iconSymbol,
        iconColor: icon.iconColor,
        iconKind: icon.iconKind,
      },
    });
  }
  return { type: 'FeatureCollection', features };
}

export function mergeSegmentAndPlanningIconPoints(
  segments: HydrowaySegment[],
  planningAreas: HydrowayPlanningArea[],
): GeoJsonFeatureCollection<GeoJSON.Point> {
  return mergeAttentionIconPoints(segments, planningAreas, [], []);
}

export function mergeAttentionIconPoints(
  segments: HydrowaySegment[],
  planningAreas: HydrowayPlanningArea[],
  alerts: HydrowayAlert[],
  checkpoints: HydrowayCheckpoint[],
): GeoJsonFeatureCollection<GeoJSON.Point> {
  const segmentIcons = toSegmentIconsFeatureCollection(segments);
  const planningDredging = toPlanningDredgingIconsFeatureCollection(planningAreas);
  const features: GeoJSON.Feature<GeoJSON.Point>[] = [
    ...segmentIcons.features,
    ...planningDredging.features,
  ];

  for (const alert of alerts) {
    const icon = resolveAlertIcon(alert);
    if (icon.iconKind !== 'draft-restriction' && icon.iconKind !== 'dredging') continue;
    if (!isValidLngLat(alert.coordinates)) continue;
    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: alert.coordinates },
      properties: {
        id: `${alert.id}-attention-icon`,
        alertId: alert.id,
        iconSymbol: icon.iconSymbol,
        iconColor: icon.iconColor,
        iconKind: icon.iconKind,
      },
    });
  }

  for (const checkpoint of checkpoints) {
    if (checkpoint.type !== 'risk-point') continue;
    if (!isValidLngLat(checkpoint.coordinates)) continue;
    const icon = resolveCheckpointIcon(checkpoint);
    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: checkpoint.coordinates },
      properties: {
        id: `${checkpoint.id}-attention-icon`,
        checkpointId: checkpoint.id,
        iconSymbol: icon.iconSymbol,
        iconColor: icon.iconColor,
        iconKind: icon.iconKind,
      },
    });
  }

  return { type: 'FeatureCollection', features };
}
