import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getSessionUser } from '@/shared/server/auth';
import { PageShell } from '@/shared/ui/page-shell/page-shell';
import { Breadcrumb } from '@/shared/ui/breadcrumb/breadcrumb';
import { MyCargoesList } from '@/features/cargo-market/components/my-cargoes-list/my-cargoes-list';
import type { AppLocale } from '@/shared/routing/route-types';
import { appRoutes, intlAppPaths } from '@/shared/routing/app-routes';
import { routeSearchParams } from '@/shared/routing/route-search-params';
import { getMyCargoesForUser } from '@/features/cargo/services/cargo.service';
import { canCreateCargo } from '@/features/auth/domain/access-control';

export default async function MinhasCargasPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const [{ locale }, sp] = await Promise.all([params, searchParams]);
  const loc = locale as AppLocale;
  const user = await getSessionUser();
  const t = await getTranslations({ locale, namespace: 'pages.minhasCargas' });
  const nav = await getTranslations({ locale, namespace: 'nav' });

  if (!user) {
    redirect(appRoutes.auth.login(loc, appRoutes.cargos.myCargos(loc)));
  }

  if (user.role === 'admin') {
    redirect(appRoutes.admin.home(loc));
  }

  const mine = await getMyCargoesForUser(user.id, user.role);
  const canCreate = canCreateCargo(user);

  const spRecord = sp as Record<string, string | undefined>;
  const createdRaw = spRecord[routeSearchParams.created];
  const createdCargoId = typeof createdRaw === 'string' && createdRaw.trim() ? createdRaw.trim() : undefined;

  const title = user.role === 'carrier' ? t('titleCarrier') : t('title');
  const description = user.role === 'carrier' ? t('descriptionCarrier') : t('description');

  return (
    <PageShell eyebrow={t('eyebrow')} title={title} description={description}>
      <Breadcrumb
        locale={locale}
        items={[{ label: nav('dashboard'), href: intlAppPaths.dashboard.home }, { label: t('breadcrumbCurrent') }]}
      />
      <MyCargoesList cargoes={mine} createdCargoId={createdCargoId} canCreateCargo={canCreate} />
    </PageShell>
  );
}
