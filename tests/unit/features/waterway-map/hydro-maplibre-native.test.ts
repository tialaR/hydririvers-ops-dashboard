import { describe, expect, it } from 'vitest';

import {
  abbreviateHydrowayPortLabel,
  hydrowayPortLabelSortKey,
  resolveHydrowayPortDisplayLabel,
  sanitizeHydrowayDisplayLabel,
} from '@/features/waterway-map/utils/hydro-maplibre-labels';
import {
  buildRouteTraveledGeoJson,
  buildVesselGeoJson,
  resolveAnimatedRouteProgress,
} from '@/features/waterway-map/utils/hydro-maplibre-animation';
import { resolveHydroMapLibreFitOptions } from '@/features/waterway-map/utils/hydro-maplibre-camera';
import { buildRouteLineGradientExpression } from '@/features/waterway-map/utils/hydro-maplibre-route-style';
import type { ExpressionSpecification, StyleSpecification } from 'maplibre-gl';

import {
  createHydroMapLibreBaseStyle,
  HYDRO_MAPLIBRE_LAYER_GROUPS,
} from '@/features/waterway-map/utils/hydro-maplibre-style';

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

function collectLayerExpressions(style: StyleSpecification): unknown[] {
  const values: unknown[] = [];
  for (const layer of style.layers ?? []) {
    if ('paint' in layer && layer.paint) {
      values.push(...Object.values(layer.paint));
    }
    if ('layout' in layer && layer.layout) {
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
    expect(hydrowayPortLabelSortKey('terminal-belem-norte', 'terminal')).toBeGreaterThan(
      hydrowayPortLabelSortKey('port-belem', 'port'),
    );
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

  it('expõe style válido com sky na raiz e layers com source', () => {
    const style = createHydroMapLibreBaseStyle(0.2);
    expect(style.sky).toBeDefined();
    expect(style.layers?.some((layer) => layer.id === 'route-remaining')).toBe(true);
    const nonBackground = style.layers?.filter((layer) => layer.type !== 'background') ?? [];
    for (const layer of nonBackground) {
      expect('source' in layer && layer.source).toBeTruthy();
    }
    expect(HYDRO_MAPLIBRE_LAYER_GROUPS.route).toContain('route-traveled-core');
  });

  it('usa no máximo um interpolate/step baseado em zoom por propriedade paint/layout', () => {
    const style = createHydroMapLibreBaseStyle(0.2);
    const invalid: string[] = [];
    for (const expr of collectLayerExpressions(style)) {
      const zoomScales = countZoomBasedScales(expr);
      if (zoomScales > 1) {
        invalid.push(JSON.stringify(expr).slice(0, 120));
      }
    }
    expect(invalid, invalid.join('\n')).toEqual([]);
  });

  it('ports-circle e ports-halo usam circle-radius com match nos outputs do zoom', () => {
    const style = createHydroMapLibreBaseStyle(0.2);
    const halo = style.layers?.find((layer) => layer.id === 'ports-halo');
    const circle = style.layers?.find((layer) => layer.id === 'ports-circle');
    expect(halo?.type).toBe('circle');
    expect(circle?.type).toBe('circle');
    if (halo?.type !== 'circle' || circle?.type !== 'circle') return;

    const haloRadius = halo.paint?.['circle-radius'];
    const circleRadius = circle.paint?.['circle-radius'];
    expect(Array.isArray(haloRadius) && haloRadius[0]).toBe('interpolate');
    expect(Array.isArray(circleRadius) && circleRadius[0]).toBe('interpolate');
    expect(countZoomBasedScales(haloRadius)).toBe(1);
    expect(countZoomBasedScales(circleRadius)).toBe(1);
  });
});
