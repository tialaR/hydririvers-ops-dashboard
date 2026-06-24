import { createShipperMobileRepositories } from '@/features/shipper-mobile-flow/data/repositories/repository-provider';

export async function listShipperCargoes() {
  const { cargo } = createShipperMobileRepositories();
  return cargo.listShipperCargoes();
}
