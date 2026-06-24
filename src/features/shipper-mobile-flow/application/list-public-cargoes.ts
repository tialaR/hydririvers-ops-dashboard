import { createShipperMobileRepositories } from '@/features/shipper-mobile-flow/data/repositories/repository-provider';

export async function listPublicCargoes() {
  const { publicCargo } = createShipperMobileRepositories();
  return publicCargo.listPublicCargoes();
}
