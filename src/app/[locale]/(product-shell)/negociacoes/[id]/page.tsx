import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { PageShell } from '@/shared/ui/page-shell/page-shell';
import { Breadcrumb } from '@/shared/ui/breadcrumb/breadcrumb';
import { Card } from '@/shared/ui/card/card';
import { NegotiationDetail } from '@/features/negotiations/components/negotiation-detail/negotiation-detail';
import { getCargoById, getNegotiationById } from '@/features/marketplace/services/marketplace.service';
import { intlAppPaths } from '@/shared/routing/app-routes';
import { translateMock } from '@/shared/i18n/mock-content';
import { getSessionUser } from '@/shared/server/auth';
import { canNegotiateCargo } from '@/features/auth/domain/access-control';

export default async function NegotiationDetailPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id, locale } = await params;
  const negotiation = await getNegotiationById(id);
  if (!negotiation) notFound();
  const user = await getSessionUser();
  const cargo = negotiation.cargoId ? await getCargoById(negotiation.cargoId) : undefined;
  if (!cargo) notFound();
  if (!canNegotiateCargo(user, cargo, [negotiation])) {
    const d = await getTranslations({ locale, namespace: 'pages.negotiationDetail' });
    return (
      <PageShell eyebrow={d('eyebrow')} title={d('accessDeniedTitle')} description={d('accessDeniedDescription')}>
        <Card data-testid="negotiation-detail-unauthorized">
          <p>{d('accessDeniedBody')}</p>
        </Card>
      </PageShell>
    );
  }

  const t = await getTranslations({ locale, namespace: 'pages.negotiationDetail' });
  const nav = await getTranslations({ locale, namespace: 'nav' });
  const title = translateMock(locale, negotiation.cargoTitle);
  const description = negotiation.vesselName?.trim()
    ? t('descriptionWithVessel', { vessel: negotiation.vesselName })
    : t('descriptionPlain');

  return (
    <PageShell eyebrow={t('eyebrow')} title={title} description={description}>
      <Breadcrumb locale={locale} items={[{ label: nav('negotiations'), href: intlAppPaths.negotiations.home }, { label: title }]} />
      <NegotiationDetail negotiation={negotiation} locale={locale} />
    </PageShell>
  );
}
