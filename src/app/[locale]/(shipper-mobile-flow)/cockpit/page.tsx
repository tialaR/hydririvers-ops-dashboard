import { getCockpitMetrics } from '@/features/shipper-mobile-flow/application/get-cockpit-metrics';
import { getCockpitTrendData } from '@/features/shipper-mobile-flow/application/get-cockpit-trend-data';
import { getDefaultShipperCargoId } from '@/features/shipper-mobile-flow/application/get-default-shipper-cargo-id';
import { CockpitScreen } from '@/features/shipper-mobile-flow/screens/cockpit-screen';

export default async function CockpitPage() {
  const [metrics, trend, defaultCargoId] = await Promise.all([
    getCockpitMetrics(),
    getCockpitTrendData(),
    getDefaultShipperCargoId()
  ]);
  return <CockpitScreen metrics={metrics} trend={trend} defaultCargoId={defaultCargoId} />;
}
