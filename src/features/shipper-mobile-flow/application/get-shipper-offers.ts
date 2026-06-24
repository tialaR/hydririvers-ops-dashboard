import { createShipperMobileRepositories } from '@/features/shipper-mobile-flow/data/repositories/repository-provider';

export async function getShipperOffers(cargoId: string) {
  const { cargo } = createShipperMobileRepositories();
  return cargo.getOffersForCargo(cargoId);
}
