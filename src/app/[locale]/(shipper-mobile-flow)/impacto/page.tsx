import { getImpactChartData } from '@/features/shipper-mobile-flow/application/get-impact-chart-data';
import { getImpactSummary } from '@/features/shipper-mobile-flow/application/get-impact-summary';
import { ImpactScreen } from '@/features/shipper-mobile-flow/screens/impact-screen';

export default async function ImpactPage() {
  const [summary, chart] = await Promise.all([getImpactSummary(), getImpactChartData()]);
  return <ImpactScreen summary={summary} chart={chart} />;
}
