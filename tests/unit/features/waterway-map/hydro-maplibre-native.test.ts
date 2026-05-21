import { describe, expect, it } from 'vitest';

import {
  abbreviateHydrowayPortLabel,
  hydrowayImportanceSortKey,
  hydrowayPortLabelSortKey,
  resolveHydrowayPortDisplayLabel,
  resolveHydrowayWaterwayDisplayLabel,
  sanitizeHydrowayDisplayLabel,
} from '@/features/waterway-map/utils/hydro-maplibre-labels';
import {
  buildRouteTraveledGeoJson,
  buildVesselGeoJson,
  resolveAnimatedRouteProgress,
} from '@/features/waterway-map/utils/hydro-maplibre-animation';
import { buildHydrowayCameraChapters } from '@/features/waterway-map/utils/hydro-maplibre-camera-chapters';
import { resolveHydroMapLibreFitOptions } from '@/features/waterway-map/utils/hydro-maplibre-camera';
import { DEV_BASEMAP_STYLE_URL } from '@/features/waterway-map/utils/hydro-maplibre-dev-basemap';
import {
  HYDRI_ROUTE_DESTINATION_MARKER_SVG_URL,
  HYDRI_ROUTE_ORIGIN_MARKER_SVG_URL,
  HYDRI_ROUTE_VESSEL_MARKER_SVG_URL,
} from '@/features/waterway-map/constants/hydro-route-marker-assets';
import {
  buildRouteMarkersGeoJson,
  buildRoutePointsGeoJson,
  extractCurrentVesselCoordinate,
  extractDestinationCoordinate,
  extractOriginCoordinate,
  getHydrowayMvpOverlayLayerDefinitions,
  HYDRI_CURRENT_CARGO_BOAT_MARKER_SVG_URL,
  HYDROWAY_MVP_OVERLAY_LAYER_IDS,
  HYDROWAY_ROUTE_MARKERS_SOURCE_ID,
} from '@/features/waterway-map/utils/hydro-maplibre-overlay';
import {
  buildRouteAnimatedDasharray,
  buildRouteLineGradientExpression,
  buildRouteRemainingFlowGradientExpression,
  buildRouteTraveledFlowGradientExpression,
  resolveRouteDestinationFlowPaint,
  resolveRoutePointPulsePaint,
  resolveRouteRiverMistPaint,
  ROUTE_DESTINATION_FLOW_DURATION_MS,
  ROUTE_RIVER_MIST_DURATION_MS,
} from '@/features/waterway-map/utils/hydro-maplibre-route-style';
import { resolveSpikeHydrowayMapModel } from '@/features/waterway-map/data/resolve-spike-hydroway-model';
import type { ExpressionSpecification } from 'maplibre-gl';

const ZOOM_INPUT: ExpressionSpecification = ['zoom'];

function isZoomInput(input: unknown): boolean {
  if (input === ZOOM_INPUT) return true;
  return Array.isArray(input) && input[0] === 'zoom';
}

function isZoomBasedScale(expr: unknown): boolean {
  if (!Array.isArray(expr) || expr.length < 4) return false;
  const op = expr[0];
  if (op === 'interpolate') return isZoomInput(expr[2]);
  if (op === 'step') return isZoomInput(expr[1]);
  return false;
}

/** Style Spec: no máximo um interpolate/step com input zoom por expressão de paint/layout. */
function countZoomBasedScales(expr: unknown): number {
  if (!Array.isArray(expr)) return 0;
  let count = isZoomBasedScale(expr) ? 1 : 0;
  for (let i = 1; i < expr.length; i += 1) {
    count += countZoomBasedScales(expr[i]);
  }
  return count;
}

function collectLayerExpressions(layers: { paint?: Record<string, unknown>; layout?: Record<string, unknown> }[]): unknown[] {
  const values: unknown[] = [];
  for (const layer of layers) {
    if (layer.paint) {
      values.push(...Object.values(layer.paint));
    }
    if (layer.layout) {
      values.push(...Object.values(layer.layout));
    }
  }
  return values;
}

describe('hydro-maplibre-native', () => {
  it('remove sufixos mock dos rótulos exibidos no mapa', () => {
    expect(sanitizeHydrowayDisplayLabel('Porto Interior Belém (mock)')).toBe('Porto Interior Belém');
    expect(sanitizeHydrowayDisplayLabel('Rio Amazonas (mock)')).toBe('Rio Amazonas');
  });

  it('gera line-gradient com progresso clampado e trecho restante discreto', () => {
    const gradient = buildRouteLineGradientExpression(0.15);
    expect(gradient[0]).toBe('interpolate');
    expect(gradient).toContain(0);
    expect(gradient.length).toBeGreaterThan(6);
    expect(JSON.stringify(gradient)).toContain('0.08');
  });

  it('gera gradientes de fluxo percorrido e restante para route-flow', () => {
    const traveled = buildRouteTraveledFlowGradientExpression(0.42);
    const remaining = buildRouteRemainingFlowGradientExpression(0.42);
    const traveledAnimated = buildRouteTraveledFlowGradientExpression(0.42, 0.25);
    expect(traveled[0]).toBe('interpolate');
    expect(remaining[0]).toBe('interpolate');
    expect(JSON.stringify(traveled)).toContain('0.42');
    expect(JSON.stringify(remaining)).toContain('0.42');
    expect(JSON.stringify(remaining)).toContain('101, 255, 232');
    expect(JSON.stringify(remaining)).not.toContain('58, 132, 168');
    expect(JSON.stringify(traveledAnimated)).not.toEqual(JSON.stringify(traveled));
  });

  it('mantém trecho restante com opacidade menor que o percorrido no gradiente', () => {
    const traveled = JSON.stringify(buildRouteTraveledFlowGradientExpression(0.35));
    const remaining = JSON.stringify(buildRouteRemainingFlowGradientExpression(0.35));
    const traveledPeak = Math.max(
      ...[...traveled.matchAll(/rgba\([^)]+,\s*([\d.]+)\)/g)].map((m) => Number(m[1])),
    );
    const remainingPeak = Math.max(
      ...[...remaining.matchAll(/rgba\([^)]+,\s*([\d.]+)\)/g)].map((m) => Number(m[1])),
    );
    expect(remainingPeak).toBeLessThan(traveledPeak);
  });

  it('abrevia rótulos de porto para clusters operacionais', () => {
    expect(resolveHydrowayPortDisplayLabel('port-belem', 'Porto Interior Belém (mock)', 'port')).toBe(
      'Belém',
    );
    expect(resolveHydrowayPortDisplayLabel('terminal-vila-conde', 'Terminal Vila do Conde (mock)', 'terminal')).toBe(
      'Vila Conde',
    );
    expect(abbreviateHydrowayPortLabel('Porto Interior Santarém Norte')).toBe('Porto Norte');
  });

  it('prioriza terminais em symbol-sort-key', () => {
    expect(hydrowayPortLabelSortKey('terminal-belem-norte', 'terminal', 'critical')).toBeGreaterThan(
      hydrowayPortLabelSortKey('port-belem', 'port', 'high'),
    );
  });

  it('resolve rótulos curtos de hidrovias para symbol-placement line', () => {
    expect(resolveHydrowayWaterwayDisplayLabel('amazonas-solimoes', 'Rio Amazonas / Solimões (mock)')).toBe(
      'Amazonas / Solimões',
    );
    expect(hydrowayImportanceSortKey('critical')).toBe(100);
    expect(hydrowayImportanceSortKey('low')).toBe(40);
  });

  it('define enquadramento por carga demo', () => {
    const cargo001 = resolveHydroMapLibreFitOptions('CARGO-001');
    const cargo004 = resolveHydroMapLibreFitOptions('CARGO-004');
    expect(cargo004.maxZoom).toBeGreaterThan(cargo001.maxZoom);
    expect(cargo001.padding.left).toBeGreaterThan(200);
  });

  it('oscila progresso animado de forma determinística', () => {
    const atStart = resolveAnimatedRouteProgress(0.15, 0);
    const midCycle = resolveAnimatedRouteProgress(0.15, 4500);
    expect(atStart).toBe(0.15);
    expect(midCycle).toBeGreaterThan(0.15);
    expect(midCycle).toBeCloseTo(0.29, 2);
  });

  it('gera GeoJSON dinâmico de rota percorrida e embarcação', () => {
    const track: GeoJSON.Position[] = [
      [-60, -3],
      [-59.5, -2.8],
      [-59, -2.5],
    ];
    const traveled = buildRouteTraveledGeoJson(track, 0.5);
    const vessel = buildVesselGeoJson(track, 0.5, 'Embarcação');
    expect(traveled.features[0]?.geometry.type).toBe('LineString');
    expect(vessel.features[0]?.geometry.type).toBe('Point');
    expect(vessel.features[0]?.properties?.heading).toBeTypeOf('number');
  });

  it('usa basemap OpenFreeMap somente na rota dev (V2.7c)', () => {
    expect(DEV_BASEMAP_STYLE_URL).toBe('https://tiles.openfreemap.org/styles/bright');
  });

  it('anima fluxo aquático com dasharray dedicado (sem line-gradient na mesma layer)', () => {
    const destination = resolveRouteDestinationFlowPaint(2400);
    const mist = resolveRouteRiverMistPaint(6000);
    expect(destination['line-opacity']).toBeGreaterThan(0.08);
    expect(destination['line-opacity']).toBeLessThanOrEqual(0.82);
    expect(mist['line-opacity']).toBeGreaterThanOrEqual(0.1);
    expect(mist['line-opacity']).toBeLessThanOrEqual(0.28);
    expect(destination['line-dasharray']).toHaveLength(3);
    expect(buildRouteAnimatedDasharray(0, 72, 420)).toEqual([0, 72, 420]);
    expect(ROUTE_DESTINATION_FLOW_DURATION_MS).toBe(9800);
    expect(ROUTE_RIVER_MIST_DURATION_MS).toBe(15000);
  });

  it('expõe overlay MVP com layers GeoJSON e pontos operacionais', () => {
    const layers = getHydrowayMvpOverlayLayerDefinitions();
    expect(layers.some((layer) => layer.id === HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeTrackCore)).toBe(true);
    expect(layers.some((layer) => layer.id === HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeTrackGlow)).toBe(true);
    expect(layers.some((layer) => layer.id === HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeFlowDestination)).toBe(
      true,
    );
    expect(layers.some((layer) => layer.id === HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeFlowRiverMist)).toBe(true);
    expect(layers.some((layer) => layer.id === HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeFlowTraveled)).toBe(true);
    expect(layers.some((layer) => layer.id === HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeFlowRemaining)).toBe(true);
    expect(layers.some((layer) => layer.id === HYDROWAY_MVP_OVERLAY_LAYER_IDS.routePointPulseOrigin)).toBe(
      true,
    );
    expect(layers.some((layer) => layer.id === HYDROWAY_MVP_OVERLAY_LAYER_IDS.routePointPulseVessel)).toBe(
      true,
    );
    expect(layers.some((layer) => layer.id === HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeMarkerCoreVessel)).toBe(
      true,
    );
    expect(layers.some((layer) => layer.id === HYDROWAY_MVP_OVERLAY_LAYER_IDS.routePoints)).toBe(true);
    const remaining = layers.find((layer) => layer.id === HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeFlowRemaining);
    expect(remaining?.type === 'line' && remaining.paint?.['line-opacity']).toBe(0.3);
    const destination = layers.find(
      (layer) => layer.id === HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeFlowDestination,
    );
    expect(destination?.type).toBe('line');
    if (destination?.type === 'line') {
      expect(destination.paint?.['line-gradient']).toBeUndefined();
      expect(destination.paint?.['line-dasharray']).toBeDefined();
    }
    const mist = layers.find((layer) => layer.id === HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeFlowRiverMist);
    expect(mist?.type).toBe('line');
    if (mist?.type === 'line') {
      expect(mist.paint?.['line-gradient']).toBeUndefined();
    }
    for (const layer of layers) {
      expect('source' in layer && layer.source).toBeTruthy();
    }
  });

  it('monta capítulos overview/origem/atual/destino por carga demo', () => {
    const model = resolveSpikeHydrowayMapModel('CARGO-001');
    const chapters = buildHydrowayCameraChapters(model.geo, model.bbox);
    expect(chapters.overview?.kind).toBe('bounds');
    expect(chapters.origin?.kind).toBe('point');
    expect(chapters.current?.kind).toBe('point');
    expect(chapters.destination?.kind).toBe('point');
  });

  it('alinha capítulo current com progresso da rota (marcador do barco)', () => {
    const model = resolveSpikeHydrowayMapModel('CARGO-001');
    const track = model.geo.routeTrack.features[0];
    const routeTrackCoords =
      track?.geometry.type === 'LineString' ? track.geometry.coordinates : [];
    const markerCoord = extractCurrentVesselCoordinate(model.geo, model.progress01, routeTrackCoords);
    const chapters = buildHydrowayCameraChapters(model.geo, model.bbox, {
      progress01: model.progress01,
      routeTrackCoords,
    });
    expect(chapters.current?.kind).toBe('point');
    if (chapters.current?.kind === 'point' && markerCoord) {
      expect(chapters.current.center).toEqual(markerCoord);
      expect(chapters.current.zoom).toBe(12);
      expect(chapters.current.duration).toBe(2600);
    }
  });

  it('usa no máximo um interpolate/step baseado em zoom por propriedade paint/layout (overlay MVP)', () => {
    const layers = getHydrowayMvpOverlayLayerDefinitions();
    const invalid: string[] = [];
    for (const expr of collectLayerExpressions(layers)) {
      const zoomScales = countZoomBasedScales(expr);
      if (zoomScales > 1) {
        invalid.push(JSON.stringify(expr).slice(0, 120));
      }
    }
    expect(invalid, invalid.join('\n')).toEqual([]);
  });

  it('route markers usam source dedicado no canvas MapLibre', () => {
    const layers = getHydrowayMvpOverlayLayerDefinitions();
    const pulse = layers.find((layer) => layer.id === HYDROWAY_MVP_OVERLAY_LAYER_IDS.routePointPulseOrigin);
    const core = layers.find((layer) => layer.id === HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeMarkerCoreOrigin);
    expect(pulse?.type).toBe('circle');
    if (pulse?.type === 'circle') {
      expect(pulse.source).toBe(HYDROWAY_ROUTE_MARKERS_SOURCE_ID);
      expect(pulse.filter).toEqual(['==', ['get', 'kind'], 'origin']);
      expect(pulse.layout?.visibility).toBe('visible');
    }
    expect(core?.type).toBe('circle');
    if (core?.type === 'circle') {
      expect(core.source).toBe(HYDROWAY_ROUTE_MARKERS_SOURCE_ID);
    }
  });

  it('calcula paint de pulso radar mais forte na embarcação', () => {
    const originMid = resolveRoutePointPulsePaint('origin', 10, 450);
    const vesselMid = resolveRoutePointPulsePaint('vessel', 10, 450);
    expect(vesselMid['circle-opacity']).toBeGreaterThan(originMid['circle-opacity']);
    expect(vesselMid['circle-radius']).toBeGreaterThan(originMid['circle-radius']);
  });

  it('buildRouteMarkersGeoJson ancora pontos nos extremos e progresso da LineString', () => {
    const track: GeoJSON.Position[] = [
      [-60, -3],
      [-59, -2],
      [-58, -1],
    ];
    const markers = buildRouteMarkersGeoJson(track, 0.5);
    expect(markers.features).toHaveLength(3);
    expect(markers.features.find((f) => f.properties?.kind === 'origin')?.geometry).toEqual({
      type: 'Point',
      coordinates: track[0],
    });
    expect(markers.features.find((f) => f.properties?.kind === 'destination')?.geometry).toEqual({
      type: 'Point',
      coordinates: track[2],
    });
    const vessel = markers.features.find((f) => f.properties?.kind === 'vessel');
    expect(vessel?.geometry.type).toBe('Point');
    expect(buildRouteMarkersGeoJson([], 0.5).features).toHaveLength(0);
  });

  it('expõe URLs dos SVGs animados (legado; marcadores da rota são layers canvas)', () => {
    expect(HYDRI_CURRENT_CARGO_BOAT_MARKER_SVG_URL).toBe('/assets/map/hydririvers-boat-icon-pulsing.svg');
    expect(HYDRI_ROUTE_VESSEL_MARKER_SVG_URL).toBe(HYDRI_CURRENT_CARGO_BOAT_MARKER_SVG_URL);
    expect(HYDRI_ROUTE_ORIGIN_MARKER_SVG_URL).toBe(
      '/assets/map/hydririvers-radar-dot-cyan-vibrant-pulsing.svg',
    );
    expect(HYDRI_ROUTE_DESTINATION_MARKER_SVG_URL).toBe(
      '/assets/map/hydririvers-radar-dot-amber-pulsing.svg',
    );
  });

  it('route-points oculta origem/destino/embarcação (renderizados em hydroway-route-markers)', () => {
    const layers = getHydrowayMvpOverlayLayerDefinitions();
    const points = layers.find((layer) => layer.id === HYDROWAY_MVP_OVERLAY_LAYER_IDS.routePoints);
    expect(points?.type).toBe('circle');
    if (points?.type !== 'circle') return;
    expect(points.filter).toEqual([
      '!',
      ['in', ['get', 'kind'], ['literal', ['origin', 'destination', 'vessel']]],
    ]);
  });

  it('route-points usa circle-radius com match nos outputs do zoom', () => {
    const layers = getHydrowayMvpOverlayLayerDefinitions();
    const points = layers.find((layer) => layer.id === HYDROWAY_MVP_OVERLAY_LAYER_IDS.routePoints);
    expect(points?.type).toBe('circle');
    if (points?.type !== 'circle') return;

    const radius = points.paint?.['circle-radius'];
    expect(Array.isArray(radius) && radius[0]).toBe('interpolate');
    expect(countZoomBasedScales(radius)).toBe(1);

    const merged = buildRoutePointsGeoJson(
      { type: 'FeatureCollection', features: [{ type: 'Feature', properties: { kind: 'origin' }, geometry: { type: 'Point', coordinates: [-59, -2] } }] },
      { type: 'FeatureCollection', features: [{ type: 'Feature', properties: { kind: 'destination' }, geometry: { type: 'Point', coordinates: [-58, -1.5] } }] },
      { type: 'FeatureCollection', features: [{ type: 'Feature', properties: { kind: 'vessel' }, geometry: { type: 'Point', coordinates: [-58.5, -1.8] } }] },
    );
    expect(merged.features).toHaveLength(3);
  });

  it('extrai coordenada da embarcação sem fallback inválido', () => {
    const model = resolveSpikeHydrowayMapModel('CARGO-001');
    const track = model.geo.routeTrack.features[0];
    const coords =
      track?.geometry.type === 'LineString' ? track.geometry.coordinates : [];
    const position = extractCurrentVesselCoordinate(model.geo, model.progress01, coords);
    expect(position).not.toBeNull();
    expect(position?.every((value) => Number.isFinite(value))).toBe(true);
  });

  it('resolve posição da embarcação mesmo sem routeTrackCoords pré-extraídas', () => {
    const model = resolveSpikeHydrowayMapModel('CARGO-004');
    const position = extractCurrentVesselCoordinate(model.geo, model.progress01, []);
    expect(position).not.toBeNull();
    expect(position?.every((value) => Number.isFinite(value))).toBe(true);
  });

  it('extrai coordenadas de origem e destino sem fallback inválido', () => {
    const model = resolveSpikeHydrowayMapModel('CARGO-004');
    const origin = extractOriginCoordinate(model.geo);
    const destination = extractDestinationCoordinate(model.geo);
    expect(origin).not.toBeNull();
    expect(destination).not.toBeNull();
    expect(origin?.every((value) => Number.isFinite(value))).toBe(true);
    expect(destination?.every((value) => Number.isFinite(value))).toBe(true);
  });
});
