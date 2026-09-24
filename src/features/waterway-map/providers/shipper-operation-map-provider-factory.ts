import type { ShipperOperationMapProvider } from './shipper-operation-map-provider';
import { MapLibreShipperOperationMapProvider } from './maplibre-shipper-operation-map-provider';

export function createShipperOperationMapProvider(): ShipperOperationMapProvider {
  return new MapLibreShipperOperationMapProvider();
}
