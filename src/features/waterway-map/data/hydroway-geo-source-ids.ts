/**
 * Identificadores estáveis de source MapLibre (V2.2b+).
 * Prefixo `hydroway-` substitui `spike-*` na integração do adapter.
 */
export const HYDROWAY_GEOJSON_SOURCE_IDS = {
  mainRivers: 'hydroway-main-rivers',
  navigableCorridors: 'hydroway-navigable-corridors',
  portsTerminals: 'hydroway-ports-terminals',
  riskZones: 'hydroway-risk-zones',
  routeTrack: 'hydroway-route-track',
  routeTraveled: 'hydroway-route-traveled',
  origin: 'hydroway-origin',
  destination: 'hydroway-destination',
  vessel: 'hydroway-vessel',
  routeBounds: 'hydroway-route-bounds',
} as const;

export type HydrowayGeoJsonSourceId =
  (typeof HYDROWAY_GEOJSON_SOURCE_IDS)[keyof typeof HYDROWAY_GEOJSON_SOURCE_IDS];
