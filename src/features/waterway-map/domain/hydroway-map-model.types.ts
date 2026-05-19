import type { WaterwayCorridorId } from '@/features/waterway-tracking/domain/waterway-corridor.types';

import type { HydrowayGeoBbox } from './hydroway-geo.types';
import type { HydrowayDemoCargoId } from './hydroway-entities.types';
import type { HydrowayMapScene } from '../providers/map-provider.types';

/**
 * Coleções GeoJSON consumidas por MapLibre (V2.2b+) e validadas em testes.
 * Camadas dinâmicas (rota, origem, destino, vessel) começam vazias no bundle estático.
 */
export type HydrowayGeoJsonSources = {
  mainRivers: GeoJSON.FeatureCollection;
  navigableCorridors: GeoJSON.FeatureCollection;
  portsTerminals: GeoJSON.FeatureCollection;
  routeTrack: GeoJSON.FeatureCollection;
  routeTraveled: GeoJSON.FeatureCollection;
  origin: GeoJSON.FeatureCollection;
  destination: GeoJSON.FeatureCollection;
  vessel: GeoJSON.FeatureCollection;
  routeBounds: GeoJSON.FeatureCollection;
};

/** Artefatos estáticos versionados (sem geometria de carga ativa). */
export type HydrowayStaticGeoBundle = Pick<
  HydrowayGeoJsonSources,
  'mainRivers' | 'navigableCorridors' | 'portsTerminals'
>;

/** Metadados operacionais derivados do adapter (V2.2b). */
export type HydrowayMapMetadata = {
  originLabel: string;
  destinationLabel: string;
  progress01: number;
  routeName: string;
  routeSource: 'demo-geojson' | 'fallback-line';
  vesselName?: string;
  segmentId?: string;
  eta?: string;
  operationalStatus?: string;
  locationFallbacks: {
    origin: boolean;
    destination: boolean;
  };
};

/**
 * Modelo unificado do mapa hidroviário: metadados operacionais + scene schematic + fontes GeoJSON.
 * O adapter Cargo → model é entregue em V2.2b; a scene permanece opcional nesta microfase.
 */
export type HydrowayMapModel = {
  cargoId: HydrowayDemoCargoId | string;
  corridorId: WaterwayCorridorId;
  progress01: number;
  metadata: HydrowayMapMetadata;
  scene?: HydrowayMapScene;
  geo: HydrowayGeoJsonSources;
  bbox: HydrowayGeoBbox;
};
