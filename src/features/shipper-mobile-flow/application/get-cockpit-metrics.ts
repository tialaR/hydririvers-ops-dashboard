import { createShipperMobileRepositories } from '@/features/shipper-mobile-flow/data/repositories/repository-provider';

export async function getCockpitMetrics() {
  const { cargo } = createShipperMobileRepositories();
  return cargo.getCockpitMetrics();
}
