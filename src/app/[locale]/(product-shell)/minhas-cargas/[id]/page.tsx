import { redirect, notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { OwnedCargoDetail } from '@/features/cargo/components/owned-cargo-detail/owned-cargo-detail';
import { getSessionUser } from '@/shared/server/auth';
import { appRoutes } from '@/shared/routing/app-routes';
import type { AppLocale } from '@/shared/routing/route-types';
import { getMyCargoByIdForUser } from '@/features/cargo/services/cargo.service';

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

  const t = await getTranslations({ locale, namespace: 'pages.minhasCargas.detail' });

  return (
    <section aria-label={t('pageAria')}>
      <OwnedCargoDetail cargo={cargo} />
    </section>
  );
}
