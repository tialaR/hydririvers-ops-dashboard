import { getTranslations } from 'next-intl/server';
import { PageShell } from '@/shared/ui/page-shell/page-shell';
import { Card } from '@/shared/ui/card/card';
import { VesselList } from '@/features/vessels/components/vessel-list/vessel-list';
import { listVessels } from '@/features/marketplace/services/marketplace.service';
import { getSessionUser } from '@/shared/server/auth';
import { canAccessRoute } from '@/features/auth/domain/access-control';

export default async function VesselsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.vessels' });
  const user = await getSessionUser();
  if (!canAccessRoute(user, 'vessels')) {
    return (
      <PageShell eyebrow={t('eyebrow')} title={t('title')} description={t('description')}>
        <Card data-testid="vessels-unauthorized">
          <h2>{t('unauthorizedTitle')}</h2>
          <p>{t('unauthorizedDescription')}</p>
        </Card>
      </PageShell>
    );
  }
  const vessels = await listVessels();

  return (
    <PageShell eyebrow={t('eyebrow')} title={t('title')} description={t('description')}>
      <VesselList vessels={vessels} locale={locale} />
    </PageShell>
  );
}
