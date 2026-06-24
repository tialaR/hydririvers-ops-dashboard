import { createShipperMobileRepositories } from '@/features/shipper-mobile-flow/data/repositories/repository-provider';

export async function getCurrentShipperUser() {
  const { user } = createShipperMobileRepositories();
  return user.getCurrentShipperUser();
}
