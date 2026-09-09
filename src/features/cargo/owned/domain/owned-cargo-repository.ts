import type { CargoDocument, CargoOffer, OwnedCargo, OwnedCargoChartPoint, OwnedCargoCockpitMetric } from './owned-cargo-types';

export type OwnedCargoMapData = OwnedCargo;

export type OwnedCargoRepository = {
  listOwnedCargoes(ownerId: string): Promise<OwnedCargo[]>;
  getOwnedCargoById(id: string, ownerId: string): Promise<OwnedCargo | undefined>;
  getOwnedCargoMapData(id: string, ownerId: string): Promise<OwnedCargoMapData | undefined>;
  getDocumentsForCargo(cargoId: string, ownerId: string): Promise<CargoDocument[]>;
  getOffersForCargo(cargoId: string, ownerId: string): Promise<CargoOffer[]>;
  getCockpitMetrics(): Promise<OwnedCargoCockpitMetric[]>;
  getCockpitTrend(): Promise<OwnedCargoChartPoint[]>;
  getDefaultCargoId(): Promise<string>;
};
