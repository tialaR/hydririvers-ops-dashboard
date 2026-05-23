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
  return {
    id: terminal.id,
    name: terminal.name,
    type: terminal.type,
    operationalStatus: terminal.operationalStatus,
    queueRisk: terminal.queueRisk,
    etaRelevance: terminal.etaRelevance,
    importance: terminal.importance,
    businessImpactSummary: terminal.businessImpactSummary,
  };
}

function pickAlertProperties(alert: HydrowayAlert): Record<string, unknown> {
  return {
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
  };
}

function pickSignalProperties(signal: HydrowaySignal): Record<string, unknown> {
  return {
    id: signal.id,
    segmentId: signal.segmentId,
    signalType: signal.signalType,
    condition: signal.condition,
    visibilityPriority: signal.visibilityPriority,
    captainHint: signal.captainHint,
  };
}

function pickCheckpointProperties(checkpoint: HydrowayCheckpoint): Record<string, unknown> {
  return {
    id: checkpoint.id,
    name: checkpoint.name,
    type: checkpoint.type,
    status: checkpoint.status,
    label: checkpoint.label,
    shortMessage: checkpoint.shortMessage,
    cargoId: checkpoint.cargoId,
    terminalId: checkpoint.terminalId,
    alertId: checkpoint.alertId,
  };
}

function pickCorridorProperties(corridor: HydrowayCorridor): Record<string, unknown> {
  return {
    id: corridor.id,
    name: corridor.name,
    region: corridor.region,
    priority: corridor.priority,
    concessionStatus: corridor.concessionStatus,
    strategicRole: corridor.strategicRole,
    businessValue: corridor.businessValue,
    sourceContext: corridor.sourceContext,
  };
}

function pickPlanningAreaProperties(area: HydrowayPlanningArea): Record<string, unknown> {
  return {
    id: area.id,
    name: area.name,
    type: area.type,
    status: area.status,
    confidence: area.confidence,
    institutionalSummary: area.institutionalSummary,
    authority: area.authority,
    sourceName: area.sourceName,
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
