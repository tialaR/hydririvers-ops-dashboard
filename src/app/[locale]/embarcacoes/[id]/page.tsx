import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { PageShell } from '@/shared/ui/page-shell/page-shell';
import { Breadcrumb } from '@/shared/ui/breadcrumb/breadcrumb';
import { Card } from '@/shared/ui/card/card';
import { VesselDetail } from '@/features/vessels/components/vessel-detail/vessel-detail';
import { getVesselById } from '@/features/marketplace/services/marketplace.service';
import { intlAppPaths } from '@/shared/routing/app-routes';
import { getSessionUser } from '@/shared/server/auth';
import { canViewVessel } from '@/features/auth/domain/access-control';

export default async function VesselDetailPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id, locale } = await params;
  const vessel = await getVesselById(id);
  if (!vessel) notFound();
  const user = await getSessionUser();
  if (!canViewVessel(user, vessel)) {
    const page = await getTranslations({ locale, namespace: 'pages.vessels' });
    return (
      <PageShell eyebrow={page('eyebrow')} title={page('title')} description={page('description')}>
        <Card data-testid="vessel-detail-unauthorized">
          <h2>{page('unauthorizedTitle')}</h2>
          <p>{page('unauthorizedDescription')}</p>
        </Card>
      </PageShell>
    );
  }

  const t = await getTranslations({ locale, namespace: 'pages.vesselDetail' });

  return (
    <PageShell eyebrow={t('eyebrow')} title={vessel.name} description={vessel.route}>
      <Breadcrumb
        locale={locale}
        items={[{ label: t('breadcrumb'), href: intlAppPaths.vessels.marketplace }, { label: vessel.name }]}
      />
      <VesselDetail vessel={vessel} locale={locale} />
    </PageShell>
  );
}
