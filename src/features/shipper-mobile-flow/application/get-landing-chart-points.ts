import { createShipperMobileRepositories } from '@/features/shipper-mobile-flow/data/repositories/repository-provider';

export async function getLandingChartPoints() {
  const { hydro } = createShipperMobileRepositories();
  return hydro.getLandingChartPoints();
}
