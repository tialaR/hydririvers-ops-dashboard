import { redirect, notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { PageShell } from '@/shared/ui/page-shell/page-shell';
import { Breadcrumb } from '@/shared/ui/breadcrumb/breadcrumb';
import { CargoDetailLoader } from '@/features/cargo-market/components/cargo-detail/cargo-detail-loader';
import { getSessionUser } from '@/shared/server/auth';
import { appRoutes, intlAppPaths } from '@/shared/routing/app-routes';
import type { AppLocale } from '@/shared/routing/route-types';
import { getMyCargoByIdForUser } from '@/features/cargo/services/cargo.service';
import { translateMock } from '@/shared/i18n/mock-content';

export default async function MyCargoDetailPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id, locale } = await params;
  const loc = locale as AppLocale;
  const user = await getSessionUser();
  if (!user) {
    redirect(appRoutes.auth.login(loc, appRoutes.cargos.myCargoDetail(loc, id)));
  }

  if (user.role === 'admin') {
    redirect(appRoutes.admin.home(loc));
  }

  const cargo = await getMyCargoByIdForUser(id, user.id, user.role);
  if (!cargo) notFound();

  const t = await getTranslations({ locale, namespace: 'pages.cargoDetail' });
  const nav = await getTranslations({ locale, namespace: 'nav' });
  const common = await getTranslations({ locale, namespace: 'common' });
  const title = translateMock(locale, cargo.title);
  const routeDescription = `${cargo.origin}${common('routeArrow')}${cargo.destination}`;

  return (
    <PageShell eyebrow={t('eyebrow')} title={title} description={routeDescription}>
      <Breadcrumb
        locale={locale}
        items={[
          { label: nav('dashboard'), href: intlAppPaths.dashboard.home },
          { label: nav('myCargoes'), href: intlAppPaths.cargos.myCargos },
          { label: title }
        ]}
      />
      <CargoDetailLoader id={id} initialCargo={cargo} viewer={{ id: user.id, role: user.role, approved: user.approved }} />
    </PageShell>
  );
}
