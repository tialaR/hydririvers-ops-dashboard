import 'server-only';

import type { HydrowayGeoJsonSources } from '../domain/hydroway-map-model.types';
import { loadHydrowayStaticGeoBundle } from '../data/load-mock-geojson.server';

/** Une bundle estático V2.2a com fontes dinâmicas da carga ativa (somente servidor). */
export function assembleHydrowayGeoJsonSources(
  dynamic: Pick<
    HydrowayGeoJsonSources,
    'routeTrack' | 'routeTraveled' | 'origin' | 'destination' | 'vessel' | 'routeBounds'
  >,
): HydrowayGeoJsonSources {
  const staticBundle = loadHydrowayStaticGeoBundle();
  return {
    ...staticBundle,
    ...dynamic,
  };
}
