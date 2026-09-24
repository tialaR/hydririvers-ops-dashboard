import type { ShipperMapRouteData } from '@/features/waterway-map/domain/owned-cargo-operation-route';

export type ShipperOperationMapProvider = {
  mount(container: HTMLElement, routeData: ShipperMapRouteData, onError: () => void): void;
  update(routeData: ShipperMapRouteData): void;
  destroy(): void;
};
