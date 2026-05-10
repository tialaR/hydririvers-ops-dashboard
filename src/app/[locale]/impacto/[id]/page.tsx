import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { PageShell } from '@/shared/ui/page-shell/page-shell';
import { Card } from '@/shared/ui/card/card';
import { Breadcrumb } from '@/shared/ui/breadcrumb/breadcrumb';
import { HydroIcon } from '@/shared/ui/hydro-icon/hydro-icon';
import { intlAppPaths } from '@/shared/routing/app-routes';

const impactIds = ['cost', 'sustainability', 'regional', 'automation', 'brdomar', 'compliance', 'connectivity', 'government'] as const;
type ImpactId = (typeof impactIds)[number];

function isImpactId(value: string): value is ImpactId {
  return impactIds.includes(value as ImpactId);
}

export default async function ImpactDetailPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id, locale } = await params;
  if (!isImpactId(id)) notFound();

  const t = await getTranslations({ locale, namespace: `impactCards.${id}` });
  const page = await getTranslations({ locale, namespace: 'pages.impactDetail' });
  const details = page.raw(`details.${id}`) as string[];

  return (
    <PageShell eyebrow={page('eyebrow')} title={t('title')} description={t('description')}>
      <Breadcrumb
        locale={locale}
        items={[{ label: page('breadcrumb'), href: intlAppPaths.impact.home }, { label: t('title') }]}
      />
      <Card className="hr-v22-detail-card">
        <span><HydroIcon name="leaf" /> {page('kicker')}</span>
        <p>{page('description')}</p>
        <ul>{details.map((item) => <li key={item}>{item}</li>)}</ul>
      </Card>
    </PageShell>
  );
}
