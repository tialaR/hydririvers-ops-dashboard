import { getTranslations } from 'next-intl/server';
import { PageShell } from '@/shared/ui/page-shell/page-shell';
import { DashboardOverview } from '@/features/dashboard/components/dashboard-overview/dashboard-overview';

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.dashboard' });

  return (
    <PageShell eyebrow={t('eyebrow')} title={t('title')} description={t('description')}>
      <DashboardOverview locale={locale} />
    </PageShell>
  );
}
