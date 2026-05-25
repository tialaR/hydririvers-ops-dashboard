/**
 * Barrel client-safe do feature waterway-map.
 * Resolvers com fs/GeoJSON e adapters server-only: importar de `@/features/waterway-map/data/*` ou `*.server.ts`.
 */
export { HydrowayMapSpikeShell } from './components/hydroway-map-spike-shell';
export { HydrowayMapSpikeClient } from './components/hydroway-map-spike-client';
export { HydrowayMapProductShell } from './components/hydroway-map-product-shell';
export { MobileHydrowayMapExperience } from './components/mobile/mobile-hydroway-map-experience';
export { CargoMapViewportRouter } from './components/cargo-map-viewport-router';
export { HYDROWAY_OPERATIONAL_LAYER_MODES } from './constants/hydroway-operational-layer-modes';
export {
  assertOperationalDatasetIntegrity,
  clampProgress01,
  hasOperationalAlertSeverity,
  isValidLineStringCoordinates,
  isValidLngLat,
} from './utils/hydroway-operational-validation';
export {
  toAlertsFeatureCollection,
  toCheckpointsFeatureCollection,
  toCorridorsFeatureCollection,
  toPlanningAreasFeatureCollection,
  toSegmentsFeatureCollection,
  toSignalsFeatureCollection,
  toTerminalsFeatureCollection,
} from './utils/hydroway-operational-geojson';
export { SvgSchematicHydrowayProvider } from './providers/svg-schematic-hydroway-provider';
export type {
  HydrowayMapProvider,
  HydrowayMapScene,
  HydrowayMapLayerId,
} from './providers/map-provider.types';
export type {
  HydrowayMapMetadata,
  HydrowayMapMobileRouteSegmentStatus,
  HydrowayMapModel,
} from './domain/hydroway-map-model.types';
