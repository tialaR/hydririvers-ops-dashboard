import { describe, expect, it } from 'vitest';

import { hydrowayModelToScene } from '@/features/waterway-map/adapters/hydroway-model-to-scene';
import { resolveSpikeHydrowayMapModel } from '@/features/waterway-map/data/resolve-spike-hydroway-model';
import { schematicPointToLngLat } from '@/features/waterway-map/utils/schematic-to-geo';
import {
  lineStringToSvgPathD,
  lngLatToSchematicPoint,
} from '@/features/waterway-map/utils/geo-to-schematic';
import { HYDRO_MAP_VIEWBOX } from '@/features/waterway-map/utils/hydro-map-style';

describe('geo-to-schematic', () => {
  it('projeta lng/lat e volta ao schematic com tolerância', () => {
    const original = { x: 420, y: 310 };
    const [lng, lat] = schematicPointToLngLat(original, HYDRO_MAP_VIEWBOX);
    const roundTrip = lngLatToSchematicPoint([lng, lat], HYDRO_MAP_VIEWBOX);

    expect(roundTrip.x).toBeCloseTo(original.x, 0);
    expect(roundTrip.y).toBeCloseTo(original.y, 0);
  });

  it('converte HydrowayMapModel em cena SVG com rota e extremidades', () => {
    const model = resolveSpikeHydrowayMapModel('CARGO-001');
    const scene = hydrowayModelToScene(model);

    expect(scene.route.cargoId).toBe('CARGO-001');
    expect(scene.route.routePathD.startsWith('M ')).toBe(true);
    expect(scene.route.traveledPathD.startsWith('M ')).toBe(true);
    expect(scene.corridors.length).toBeGreaterThan(0);
    expect(scene.cities.length).toBeGreaterThan(0);
  });

  it('gera path SVG a partir de LineString', () => {
    const path = lineStringToSvgPathD(
      [
        [-50, -1.5],
        [-49, -1.4],
      ],
      HYDRO_MAP_VIEWBOX,
    );

    expect(path).toMatch(/^M [\d.]+ [\d.]+ L [\d.]+ [\d.]+$/);
  });
});
