import type { WaterwayCorridorId } from '@/features/waterway-tracking/domain/waterway-corridor.types';

import type { HydrowayGeoBbox, HydrowayGeoFeatureCollection } from './hydroway-geo.types';
import type { HydrowayDemoCargoId } from './hydroway-entities.types';
import type { HydrowayMapScene } from '../providers/map-provider.types';

/**
 * Coleções GeoJSON consumidas por MapLibre (V2.2b+) e validadas em testes.
 * Camadas dinâmicas (rota, origem, destino, vessel) começam vazias no bundle estático.
 */
export type HydrowayGeoJsonSources = {
  mainRivers: HydrowayGeoFeatureCollection;
  navigableCorridors: HydrowayGeoFeatureCollection;
  portsTerminals: HydrowayGeoFeatureCollection;
  riskZones: HydrowayGeoFeatureCollection;
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
  'mainRivers' | 'navigableCorridors' | 'portsTerminals' | 'riskZones'
>;

/** Status serializável do próximo trecho para UI mobile (resolvido no servidor). */
export type HydrowayMapMobileRouteSegmentStatus = 'onTime' | 'attention' | 'delayed';

/** Metadados operacionais derivados do adapter (V2.2b). */
export type HydrowayMapMetadata = {
  originLabel: string;
  destinationLabel: string;
  progress01: number;
  routeName: string;
  routeTechnicalRef: string;
  routeSource: 'demo-geojson' | 'fallback-line';
  vesselName?: string;
  segmentId?: string;
  eta?: string;
  operationalStatus?: string;
  /** Próximo trecho/terminal — preenchido no adapter para consumo client-safe. */
  nextSegmentLabel?: string;
  nextSegmentDetail?: string;
  nextSegmentStatus?: HydrowayMapMobileRouteSegmentStatus;
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
