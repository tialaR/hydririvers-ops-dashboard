import { createShipperMobileRepositories } from '@/features/shipper-mobile-flow/data/repositories/repository-provider';

export async function getShipperCargoById(id: string) {
  const { cargo } = createShipperMobileRepositories();
  return cargo.getShipperCargoById(id);
}
