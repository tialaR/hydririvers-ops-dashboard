import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { PageShell } from '@/shared/ui/page-shell/page-shell';
import { Breadcrumb } from '@/shared/ui/breadcrumb/breadcrumb';
import { intlAppPaths } from '@/shared/routing/app-routes';
import { ImpactDetailBody, type ImpactDetailId } from '@/features/impact/components/impact-detail-body/impact-detail-body';

const impactIds = ['cost', 'sustainability', 'regional', 'automation', 'brdomar', 'compliance', 'connectivity', 'government'] as const;

function isImpactId(value: string): value is ImpactDetailId {
  return impactIds.includes(value as ImpactDetailId);
}

export default async function ImpactDetailPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id, locale } = await params;
  if (!isImpactId(id)) notFound();

  const t = await getTranslations({ locale, namespace: `impactCards.${id}` });
  const page = await getTranslations({ locale, namespace: 'pages.impactDetail' });

  return (
    <PageShell eyebrow={page('eyebrow')} title={t('title')} description={t('description')}>
      <Breadcrumb
        locale={locale}
        items={[{ label: page('breadcrumb'), href: intlAppPaths.impact.home }, { label: t('title') }]}
      />
      <ImpactDetailBody id={id} locale={locale} />
    </PageShell>
  );
}
