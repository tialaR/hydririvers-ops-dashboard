import type {
  ShipperChartPoint,
  ShipperCockpitMetric,
  ShipperDocument,
  ShipperOffer,
  ShipperOwnedCargo
} from '@/features/shipper-mobile-flow/types/shipper-flow-types';

export type CargoMapData = ShipperOwnedCargo;

export type CargoRepository = {
  listShipperCargoes(): Promise<ShipperOwnedCargo[]>;
  getShipperCargoById(id: string): Promise<ShipperOwnedCargo | undefined>;
  getCargoMapData(id: string): Promise<CargoMapData | undefined>;
  getDocumentsForCargo(cargoId: string): Promise<ShipperDocument[]>;
  getOffersForCargo(cargoId: string): Promise<ShipperOffer[]>;
  getCockpitMetrics(): Promise<ShipperCockpitMetric[]>;
  getCockpitTrend(): Promise<ShipperChartPoint[]>;
  getDefaultCargoId(): Promise<string>;
};
