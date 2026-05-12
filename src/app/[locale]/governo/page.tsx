import { getTranslations } from 'next-intl/server';
import { PageShell } from '@/shared/ui/page-shell/page-shell';
import { GovernmentDashboard } from '@/features/government/components/government-dashboard/government-dashboard';
import { Card } from '@/shared/ui/card/card';
import { getSessionUser } from '@/shared/server/auth';
import { canAccessRoute } from '@/features/auth/domain/access-control';

export default async function GovernmentPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.governmentPage' });
  const user = await getSessionUser();

  if (!canAccessRoute(user, 'government')) {
    return (
      <PageShell eyebrow={t('eyebrow')} title={t('title')} description={t('description')}>
        <Card data-testid="government-unauthorized">
          <h2>{t('unauthorizedTitle')}</h2>
          <p>{t('unauthorizedDescription')}</p>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell eyebrow={t('eyebrow')} title={t('title')} description={t('description')}>
      <GovernmentDashboard locale={locale} />
    </PageShell>
  );
}
