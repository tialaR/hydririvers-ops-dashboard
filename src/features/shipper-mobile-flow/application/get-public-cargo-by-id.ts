import { createShipperMobileRepositories } from '@/features/shipper-mobile-flow/data/repositories/repository-provider';

export async function getPublicCargoById(id: string) {
  const { publicCargo } = createShipperMobileRepositories();
  return publicCargo.getPublicCargoById(id);
}
