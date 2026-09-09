import { getHydrologyChartData } from '@/features/hydrology/application/get-hydrology-chart-data';
import { getHydrologySummary } from '@/features/hydrology/application/get-hydrology-summary';
import { HydrologyScreen } from '@/features/hydrology/screens/hydrology-screen';
import { MobileAppShell } from '@/features/product-shell/components/mobile-app-shell/mobile-app-shell';
import { getTranslations } from 'next-intl/server';

export default async function HydrologyPage() {
  const [summary, chart, t] = await Promise.all([
    getHydrologySummary(),
    getHydrologyChartData(),
    getTranslations('shipperMobileFlow.hydrology')
  ]);

  return (
    <MobileAppShell title={t('title')}>
      <HydrologyScreen summary={summary} chart={chart} />
    </MobileAppShell>
  );
}
