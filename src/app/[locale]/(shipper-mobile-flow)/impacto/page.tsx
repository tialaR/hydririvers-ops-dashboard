import { getImpactChartData } from '@/features/impact/application/get-impact-chart-data';
import { getImpactSummary } from '@/features/impact/application/get-impact-summary';
import { ImpactScreen } from '@/features/impact/screens/impact-screen';
import { MobileAppShell } from '@/features/product-shell/components/mobile-app-shell/mobile-app-shell';
import { getTranslations } from 'next-intl/server';

export default async function ImpactPage() {
  const [summary, chart, t] = await Promise.all([
    getImpactSummary(),
    getImpactChartData(),
    getTranslations('shipperMobileFlow.impact')
  ]);

  return (
    <MobileAppShell title={t('title')}>
      <ImpactScreen summary={summary} chart={chart} />
    </MobileAppShell>
  );
}
