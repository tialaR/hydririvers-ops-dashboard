import { describe, expect, it } from 'vitest';

import { HYDROWAY_MOCK_GEO_BUDGET } from '@/features/waterway-map/domain/hydroway-geo.types';
import { getHydrowayMockGeoJsonByteSizes } from '@/features/waterway-map/data/load-mock-geojson.server';

describe('hydroway mock geojson budget', () => {
  it('respeita orçamento ADR 0031 por arquivo e combinado', () => {
    const sizes = getHydrowayMockGeoJsonByteSizes();
    const entries = Object.entries(sizes);

    for (const [filename, bytes] of entries) {
      expect(bytes, `${filename} exceeds per-file budget`).toBeLessThanOrEqual(
        HYDROWAY_MOCK_GEO_BUDGET.maxBytesPerFile,
      );
    }

    const combined = entries.reduce((sum, [, bytes]) => sum + bytes, 0);
    expect(combined).toBeLessThanOrEqual(HYDROWAY_MOCK_GEO_BUDGET.maxBytesCombined);
  });
});
