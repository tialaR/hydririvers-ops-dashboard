import { describe, expect, it } from 'vitest';

import {
  getCoordinateAtRouteProgress,
  getRouteMarkerCoordinates,
  normalizeRouteProgress,
  sanitizeRouteCoordinates,
  type LngLatTuple
} from '@/features/cargo-map/utils/route-marker-geometry';

describe('route-marker-geometry', () => {
  it('normalizes progress', () => {
    expect(normalizeRouteProgress(undefined)).toBe(0.5);
    expect(normalizeRouteProgress(null)).toBe(0.5);
    expect(normalizeRouteProgress(-10)).toBe(0);
    expect(normalizeRouteProgress(0.4)).toBe(0.4);
    expect(normalizeRouteProgress(40)).toBe(0.4);
    expect(normalizeRouteProgress(200)).toBe(1);
  });

  it('sanitizes invalid coordinates', () => {
    expect(
      sanitizeRouteCoordinates([
        [-50, -1],
        ['bad', -1],
        [-49, 0],
        [Number.NaN, 1]
      ])
    ).toEqual([
      [-50, -1],
      [-49, 0]
    ]);
  });

  it('interpolates by accumulated LineString length', () => {
    const route: LngLatTuple[] = [
      [0, 0],
      [10, 0],
      [10, 10]
    ];

    expect(getCoordinateAtRouteProgress(route, 0)).toEqual([0, 0]);
    expect(getCoordinateAtRouteProgress(route, 0.25)).toEqual([5, 0]);
    expect(getCoordinateAtRouteProgress(route, 0.5)).toEqual([10, 0]);
    expect(getCoordinateAtRouteProgress(route, 0.75)).toEqual([10, 5]);
    expect(getCoordinateAtRouteProgress(route, 1)).toEqual([10, 10]);
  });

  it('derives markers from the same route geometry', () => {
    const route: LngLatTuple[] = [
      [-52, -2],
      [-51, -1],
      [-50, 0]
    ];

    expect(getRouteMarkerCoordinates({ routeCoordinates: route, progress: 50 })).toEqual({
      origin: [-52, -2],
      vessel: [-51, -1],
      destination: [-50, 0]
    });
  });
});
