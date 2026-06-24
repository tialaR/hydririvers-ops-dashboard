import { createShipperMobileRepositories } from '@/features/shipper-mobile-flow/data/repositories/repository-provider';

export async function getPhoneCountries() {
  const { user } = createShipperMobileRepositories();
  return user.getPhoneCountries();
}
