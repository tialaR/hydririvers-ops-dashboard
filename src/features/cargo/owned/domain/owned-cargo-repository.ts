import type { CargoDocument, CargoOffer, OwnedCargo, OwnedCargoChartPoint, OwnedCargoCockpitMetric } from './owned-cargo-types';

export type OwnedCargoMapData = OwnedCargo;

export type OwnedCargoRepository = {
  listOwnedCargoes(): Promise<OwnedCargo[]>;
  getOwnedCargoById(id: string): Promise<OwnedCargo | undefined>;
  getOwnedCargoMapData(id: string): Promise<OwnedCargoMapData | undefined>;
  getDocumentsForCargo(cargoId: string): Promise<CargoDocument[]>;
  getOffersForCargo(cargoId: string): Promise<CargoOffer[]>;
  getCockpitMetrics(): Promise<OwnedCargoCockpitMetric[]>;
  getCockpitTrend(): Promise<OwnedCargoChartPoint[]>;
  getDefaultCargoId(): Promise<string>;
};
