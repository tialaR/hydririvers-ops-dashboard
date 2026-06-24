import { getHydrologyChartData } from '@/features/shipper-mobile-flow/application/get-hydrology-chart-data';
import { getHydrologySummary } from '@/features/shipper-mobile-flow/application/get-hydrology-summary';
import { HydrologyScreen } from '@/features/shipper-mobile-flow/screens/hydrology-screen';

export default async function HydrologyPage() {
  const [summary, chart] = await Promise.all([getHydrologySummary(), getHydrologyChartData()]);
  return <HydrologyScreen summary={summary} chart={chart} />;
}
