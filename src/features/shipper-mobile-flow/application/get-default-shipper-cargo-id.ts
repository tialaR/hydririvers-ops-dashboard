import { createShipperMobileRepositories } from '@/features/shipper-mobile-flow/data/repositories/repository-provider';

export async function getDefaultShipperCargoId() {
  const { cargo } = createShipperMobileRepositories();
  return cargo.getDefaultCargoId();
}
