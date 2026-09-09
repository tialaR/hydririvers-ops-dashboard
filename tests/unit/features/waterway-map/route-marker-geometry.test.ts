import { describe, expect, it } from 'vitest';

import { resolveSpikeHydrowayMapModel } from '@/features/waterway-map/data/resolve-spike-hydroway-model';
import {
  extractRouteTrackCoordinates,
  resolveEffectiveRouteTrack,
} from '@/features/waterway-map/utils/hydro-maplibre-geo';
import {
  extractCurrentVesselCoordinate,
  extractDestinationCoordinate,
  extractOriginCoordinate,
  resolveRouteMarkerCoordinates,
} from '@/features/waterway-map/utils/hydro-maplibre-overlay';
import {
  getCoordinateAtRouteProgress,
  getRouteDestinationCoordinate,
  getRouteOriginCoordinate,
  normalizeRouteProgress,
} from '@/features/waterway-map/utils/route-marker-geometry';

const CURVED_TRACK: GeoJSON.Position[] = [
  [-60, -3],
  [-59.2, -2.2],
  [-58.8, -3.1],
  [-58, -1.5],
];

describe('route-marker-geometry', () => {
  it('normaliza progresso percentual e fração', () => {
    expect(normalizeRouteProgress(40)).toBeCloseTo(0.4, 5);
    expect(normalizeRouteProgress(0.4)).toBeCloseTo(0.4, 5);
    expect(normalizeRouteProgress(Number.NaN)).toBe(0.5);
  });

  it('retorna null para rota vazia ou com menos de dois vértices', () => {
    expect(getCoordinateAtRouteProgress([], 0.5)).toBeNull();
    expect(resolveRouteMarkerCoordinates([], 0.5)).toEqual({
      origin: null,
      destination: null,
      vessel: null,
    });
    expect(resolveRouteMarkerCoordinates([[-60, -3]], 0.5)).toEqual({
      origin: null,
      destination: null,
      vessel: null,
    });
  });

  it('ancora origem e destino nos extremos da LineString', () => {
    expect(getRouteOriginCoordinate(CURVED_TRACK)).toEqual(CURVED_TRACK[0]);
    expect(getRouteDestinationCoordinate(CURVED_TRACK)).toEqual(
      CURVED_TRACK[CURVED_TRACK.length - 1],
    );
  });

  it('interpola embarcação ao longo da rota (não linha reta origem→destino)', () => {
    const atMid = getCoordinateAtRouteProgress(CURVED_TRACK, 0.5);
    const linearMid: GeoJSON.Position = [
      (CURVED_TRACK[0][0] + CURVED_TRACK[3][0]) / 2,
      (CURVED_TRACK[0][1] + CURVED_TRACK[3][1]) / 2,
    ];

    expect(atMid).not.toBeNull();
    expect(atMid).not.toEqual(linearMid);
    expect(getCoordinateAtRouteProgress(CURVED_TRACK, 0)).toEqual(CURVED_TRACK[0]);
    expect(getCoordinateAtRouteProgress(CURVED_TRACK, 1)).toEqual(CURVED_TRACK[3]);
    expect(getCoordinateAtRouteProgress(CURVED_TRACK, 100)).toEqual(CURVED_TRACK[3]);
  });

  it('resolveEffectiveRouteTrack prioriza coords explícitas e sanitiza vértices', () => {
    const model = resolveSpikeHydrowayMapModel('CARGO-001');
    const track = extractRouteTrackCoordinates(model.geo);
    const withNoise: GeoJSON.Position[] = [
      track[0],
      [Number.NaN, 1] as GeoJSON.Position,
      track[1],
      ...track.slice(2),
    ];

    expect(resolveEffectiveRouteTrack(model.geo, withNoise)).toEqual(track);
    expect(resolveEffectiveRouteTrack(model.geo, [])).toEqual(track);
  });

  it('prioriza routeTrack sobre pontos GeoJSON divergentes', () => {
    const model = resolveSpikeHydrowayMapModel('CARGO-001');
    const track = extractRouteTrackCoordinates(model.geo);
    const divergentOrigin: GeoJSON.Position = [-99, 9];
    const divergentDestination: GeoJSON.Position = [-88, 8];

    const geo = {
      ...model.geo,
      origin: {
        type: 'FeatureCollection' as const,
        features: [
          {
            type: 'Feature' as const,
            properties: { kind: 'origin' },
            geometry: { type: 'Point' as const, coordinates: divergentOrigin },
          },
        ],
      },
      destination: {
        type: 'FeatureCollection' as const,
        features: [
          {
            type: 'Feature' as const,
            properties: { kind: 'destination' },
            geometry: { type: 'Point' as const, coordinates: divergentDestination },
          },
        ],
      },
    };

    expect(extractOriginCoordinate(geo, track)).toEqual(track[0]);
    expect(extractDestinationCoordinate(geo, track)).toEqual(track[track.length - 1]);
    expect(extractOriginCoordinate(geo, track)).not.toEqual(divergentOrigin);
    expect(extractDestinationCoordinate(geo, track)).not.toEqual(divergentDestination);

    const markers = resolveRouteMarkerCoordinates(track, model.progress01);
    expect(markers.origin).toEqual(track[0]);
    expect(markers.destination).toEqual(track[track.length - 1]);
    expect(markers.vessel).toEqual(extractCurrentVesselCoordinate(geo, model.progress01, track));
  });
});
