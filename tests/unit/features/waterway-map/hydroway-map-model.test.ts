import { describe, expect, it } from 'vitest';

import type { HydrowayMapModel } from '@/features/waterway-map/providers/map-provider.types';
import { HYDROWAY_MOCK_GEO_BBOX_TUPLE } from '@/features/waterway-map/domain/hydroway-geo.types';
import { loadHydrowayGeoJsonSources } from '@/features/waterway-map/data/load-mock-geojson';

describe('HydrowayMapModel', () => {
  it('aceita estrutura mínima com geo e metadados (sem scene)', () => {
    const model: HydrowayMapModel = {
      cargoId: 'CARGO-001',
      corridorId: 'amazonas',
      progress01: 0.15,
      geo: loadHydrowayGeoJsonSources(),
      bbox: HYDROWAY_MOCK_GEO_BBOX_TUPLE,
    };

    expect(model.cargoId).toBe('CARGO-001');
    expect(model.geo.mainRivers.features.length).toBeGreaterThan(0);
    expect(model.scene).toBeUndefined();
  });
});
