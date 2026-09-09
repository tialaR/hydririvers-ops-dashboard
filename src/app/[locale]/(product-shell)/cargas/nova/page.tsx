import { getTranslations } from 'next-intl/server';
import { NewCargoForm } from '@/features/cargo-market/components/new-cargo-form/new-cargo-form';
import { PageShell } from '@/shared/ui/page-shell/page-shell';
import { Breadcrumb } from '@/shared/ui/breadcrumb/breadcrumb';
import { Card } from '@/shared/ui/card/card';
import { getSessionUser } from '@/shared/server/auth';
import { intlAppPaths } from '@/shared/routing/app-routes';
import { canAccessRoute } from '@/features/auth/domain/access-control';

type NewCargoPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function NewCargoPage({ params }: NewCargoPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.newCargo' });
  const nav = await getTranslations({ locale, namespace: 'nav' });
  const user = await getSessionUser();

  if (!canAccessRoute(user, 'cargo-create')) {
    return (
      <PageShell namespace="pages.newCargo" locale={locale}>
        <Card data-testid="new-cargo-unauthorized">
          <h2>{t('unauthorizedTitle')}</h2>
          <p>{t('unauthorizedDescription')}</p>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell
      namespace="pages.newCargo"
      eyebrow={t('eyebrow')}
      title={t('title')}
      description={t('description')}
    >
      <Breadcrumb
        locale={locale}
        items={[
          { label: nav('cargoes'), href: intlAppPaths.cargos.marketplace },
          { label: t('breadcrumbCurrent') }
        ]}
      />
      <NewCargoForm />
    </PageShell>
  );
}
