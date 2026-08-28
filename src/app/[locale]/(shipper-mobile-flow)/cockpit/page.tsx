import { getMobileCockpitMetrics } from '@/features/dashboard/application/get-mobile-cockpit-metrics';
import { getMobileCockpitTrendData } from '@/features/dashboard/application/get-mobile-cockpit-trend-data';
import { getMobileCockpitDefaultCargoId } from '@/features/dashboard/application/get-mobile-cockpit-default-cargo-id';
import { MobileCockpitScreen } from '@/features/dashboard/components/mobile-cockpit/mobile-cockpit-screen';

export default async function CockpitPage() {
  const [metrics, trend, defaultCargoId] = await Promise.all([
    getMobileCockpitMetrics(),
    getMobileCockpitTrendData(),
    getMobileCockpitDefaultCargoId()
  ]);
  return <MobileCockpitScreen metrics={metrics} trend={trend} defaultCargoId={defaultCargoId} />;
}
