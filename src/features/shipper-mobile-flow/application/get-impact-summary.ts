import { createShipperMobileRepositories } from '@/features/shipper-mobile-flow/data/repositories/repository-provider';

export async function getImpactSummary() {
  const { hydro } = createShipperMobileRepositories();
  return hydro.getImpactSummary();
}
