import { describe, expect, it } from 'vitest';

import {
  HYDRI_ROUTE_DESTINATION_MARKER_SVG_URL,
  HYDRI_ROUTE_ORIGIN_MARKER_SVG_URL,
  HYDRI_ROUTE_VESSEL_MARKER_SVG_URL,
} from '@/features/waterway-map/constants/hydro-route-marker-assets';
import { resolveRouteMarkerVisibleKinds } from '@/features/waterway-map/utils/hydro-maplibre-route-markers';

describe('hydro-maplibre-route-markers', () => {
  it('expõe URLs dos SVGs animados por tipo de marcador', () => {
    expect(HYDRI_ROUTE_ORIGIN_MARKER_SVG_URL).toContain('cyan-transparent');
    expect(HYDRI_ROUTE_DESTINATION_MARKER_SVG_URL).toContain('amber-transparent');
    expect(HYDRI_ROUTE_VESSEL_MARKER_SVG_URL).toContain('boat');
  });

  it('resolve visibilidade dos marcadores conforme camadas do mapa', () => {
    expect(resolveRouteMarkerVisibleKinds(new Set(['cargo-route']))).toEqual(
      new Set(['origin', 'destination', 'vessel']),
    );
    expect(resolveRouteMarkerVisibleKinds(new Set(['vessel']))).toEqual(new Set(['vessel']));
    expect(resolveRouteMarkerVisibleKinds(new Set(['ports']))).toEqual(new Set());
  });
});
