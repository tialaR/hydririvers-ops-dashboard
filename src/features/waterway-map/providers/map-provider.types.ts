export type {
  HydrowayGeoJsonSources,
  HydrowayMapMetadata,
  HydrowayMapModel,
  HydrowayStaticGeoBundle,
} from '../domain/hydroway-map-model.types';
import type { HydrowayMapModel } from '../domain/hydroway-map-model.types';

export type HydrowayMapPoint = { x: number; y: number };

export type HydrowayMapViewBox = {
  width: number;
  height: number;
};

export type HydrowayMapCamera = {
  x: number;
  y: number;
  width: number;
  height: number;
  zoom: number;
};

export type HydrowayMapLayerId =
  | 'waterway-main'
  | 'waterway-tributary'
  | 'cargo-route'
  | 'ports'
  | 'vessel';

export type HydrowayLayerToggleResult = {
  appliedLayerCount: number;
  hydrographyAvailable: boolean;
};

export type HydrowayRiverCorridorScene = {
  id: string;
  label: string;
  labelPoint: HydrowayMapPoint;
  pathD: string;
};

export type HydrowayCityMarkerScene = {
  id: string;
  name: string;
  point: HydrowayMapPoint;
};

export type HydrowayCargoRouteScene = {
  cargoId: string;
  corridorId: string;
  originLabel: string;
  destinationLabel: string;
  origin: HydrowayMapPoint;
  destination: HydrowayMapPoint;
  routePathD: string;
  traveledPathD: string;
  vessel: HydrowayMapPoint;
  progress01: number;
};

export type HydrowayMapScene = {
  corridors: HydrowayRiverCorridorScene[];
  cities: HydrowayCityMarkerScene[];
  route: HydrowayCargoRouteScene;
};

export type HydrowayMapProviderInit = {
  container: HTMLElement;
  model: HydrowayMapModel;
  viewBox?: HydrowayMapViewBox;
  camera?: HydrowayMapCamera;
  /** Accessible name for the HTML marker at current cargo / vessel position (MapLibre). */
  currentCargoMarkerAriaLabel?: string;
  /** Accessible name for the animated origin marker (MapLibre). */
  originMarkerAriaLabel?: string;
  /** Accessible name for the animated destination marker (MapLibre). */
  destinationMarkerAriaLabel?: string;
};

export interface HydrowayMapProvider {
  readonly kind: 'svg-schematic' | 'maplibre';
  mount(init: HydrowayMapProviderInit): void;
  setCamera(camera: Partial<HydrowayMapCamera>): void;
  fitBounds(points: HydrowayMapPoint[], padding?: number): void;
  setLayers(layers: HydrowayMapLayerId[]): void | HydrowayLayerToggleResult;
  getCamera(): HydrowayMapCamera;
  destroy(): void;
}
