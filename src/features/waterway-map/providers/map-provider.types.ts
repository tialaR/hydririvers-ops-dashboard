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
  viewBox: HydrowayMapViewBox;
  scene: HydrowayMapScene;
  camera?: HydrowayMapCamera;
};

export interface HydrowayMapProvider {
  readonly kind: 'svg-schematic' | 'maplibre';
  mount(init: HydrowayMapProviderInit): void;
  setCamera(camera: Partial<HydrowayMapCamera>): void;
  fitBounds(points: HydrowayMapPoint[], padding?: number): void;
  setLayers(layers: HydrowayMapLayerId[]): void;
  getCamera(): HydrowayMapCamera;
  destroy(): void;
}
