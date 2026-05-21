import { describe, expect, it } from 'vitest';

import { normalizeRouteProgress } from '@/features/waterway-map/utils/route-coordinate-at-progress';

describe('route-coordinate-at-progress (deprecated re-export)', () => {
  it('re-exporta normalizeRouteProgress de route-marker-geometry', () => {
    expect(normalizeRouteProgress(0.25)).toBe(0.25);
  });
});
