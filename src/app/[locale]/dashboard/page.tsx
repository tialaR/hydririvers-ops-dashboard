import { getTranslations } from 'next-intl/server';
import { PageShell } from '@/shared/ui/page-shell/page-shell';
import { DashboardOverview } from '@/features/dashboard/components/dashboard-overview/dashboard-overview';
import { Card } from '@/shared/ui/card/card';
import { Link } from '@/core/i18n/navigation';
import { HydroIcon } from '@/shared/ui/hydro-icon/hydro-icon';
import { intlAppPaths } from '@/shared/routing/app-routes';

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.dashboard' });

  return (
    <PageShell eyebrow={t('eyebrow')} title={t('title')} description={t('description')}>
      <Card
        style={{
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: 'minmax(0, 1fr) auto',
          alignItems: 'center'
        }}
      >
        <div>
          <p>{t('marketplaceEyebrow')}</p>
          <h2>{t('marketplaceTitle')}</h2>
          <span>{t('marketplaceDescription')}</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.75rem', justifyContent: 'flex-end' }}>
          <Link href={intlAppPaths.cargos.marketplace} style={{ display: 'inline-flex', alignItems: 'center', gap: '.45rem' }}>
            <HydroIcon name="cargo" size={16} />
            {t('marketplaceCta')}
          </Link>
          <Link href={intlAppPaths.cargos.myCargos} style={{ display: 'inline-flex', alignItems: 'center', gap: '.45rem' }}>
            {t('myCargoesCta')}
          </Link>
        </div>
      </Card>
      <DashboardOverview locale={locale} />
    </PageShell>
  );
}
