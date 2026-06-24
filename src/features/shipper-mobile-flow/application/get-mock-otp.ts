import { createShipperMobileRepositories } from '@/features/shipper-mobile-flow/data/repositories/repository-provider';

export async function getMockOtp() {
  const { user } = createShipperMobileRepositories();
  return user.getMockOtp();
}
