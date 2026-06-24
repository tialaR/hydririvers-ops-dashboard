import { createShipperMobileRepositories } from '@/features/shipper-mobile-flow/data/repositories/repository-provider';

export async function getHydrologySummary() {
  const { hydro } = createShipperMobileRepositories();
  return hydro.getHydrologySummary();
}
