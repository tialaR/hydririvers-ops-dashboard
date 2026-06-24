import { createShipperMobileRepositories } from '@/features/shipper-mobile-flow/data/repositories/repository-provider';

export async function getShipperDocuments(cargoId: string) {
  const { cargo } = createShipperMobileRepositories();
  return cargo.getDocumentsForCargo(cargoId);
}
