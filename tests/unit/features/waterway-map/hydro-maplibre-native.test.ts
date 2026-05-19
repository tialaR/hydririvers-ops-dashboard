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
  buildRoutePointsGeoJson,
  getHydrowayMvpOverlayLayerDefinitions,
  HYDROWAY_MVP_OVERLAY_LAYER_IDS,
} from '@/features/waterway-map/utils/hydro-maplibre-overlay';
import { buildRouteLineGradientExpression } from '@/features/waterway-map/utils/hydro-maplibre-route-style';
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

  it('expõe overlay MVP com layers GeoJSON e pontos operacionais', () => {
    const layers = getHydrowayMvpOverlayLayerDefinitions();
    expect(layers.some((layer) => layer.id === HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeTrackCore)).toBe(true);
    expect(layers.some((layer) => layer.id === HYDROWAY_MVP_OVERLAY_LAYER_IDS.routeTraveledCore)).toBe(true);
    expect(layers.some((layer) => layer.id === HYDROWAY_MVP_OVERLAY_LAYER_IDS.routePoints)).toBe(true);
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
});
