import { describe, expect, it } from 'vitest';

import { buildSpikeSceneGeoJson } from '@/features/waterway-map/data/spike-scene-geojson';
import {
  parseSvgPathToPoints,
  schematicPathToLineString,
  schematicPointToLngLat,
  SPIKE_GEO_BBOX,
} from '@/features/waterway-map/utils/schematic-to-geo';

describe('schematic-to-geo', () => {
  it('converte ponto schematico para WGS84 dentro do bbox fictício', () => {
    const [lng, lat] = schematicPointToLngLat({ x: 0, y: 0 });
    expect(lng).toBe(SPIKE_GEO_BBOX.west);
    expect(lat).toBe(SPIKE_GEO_BBOX.north);
  });

  it('parseia path M/C do mock de rio', () => {
    const points = parseSvgPathToPoints('M 80 520 C 280 500, 420 470, 620 455');
    expect(points.length).toBeGreaterThan(2);
    expect(points[0]).toEqual({ x: 80, y: 520 });
  });

  it('gera GeoJSON determinístico para CARGO-001', () => {
    const bundle = buildSpikeSceneGeoJson();
    expect(bundle.rivers.features).toHaveLength(2);
    expect(bundle.routeTrack.features[0]?.geometry.type).toBe('LineString');
    const geometry = bundle.routeTrack.features[0]?.geometry;
    const coords = geometry?.type === 'LineString' ? geometry.coordinates : [];
    expect(coords.length).toBeGreaterThan(1);

    const repeat = buildSpikeSceneGeoJson();
    expect(repeat.routeTrack).toEqual(bundle.routeTrack);
  });

  it('mantém rota Belém → Santarém em longitude decrescente (oeste)', () => {
    const line = schematicPathToLineString(
      'M 1420 430 C 1340 438, 1260 448, 1180 456 C 1100 462, 1040 466, 980 468',
    );
    const first = line[0];
    const last = line[line.length - 1];
    if (!first || !last) throw new Error('missing coordinates');
    expect(first[0]).toBeGreaterThan(last[0]);
  });
});
