import { createShipperMobileRepositories } from '@/features/shipper-mobile-flow/data/repositories/repository-provider';

export async function getCargoMapData(id: string) {
  const { cargo } = createShipperMobileRepositories();
  return cargo.getCargoMapData(id);
}
