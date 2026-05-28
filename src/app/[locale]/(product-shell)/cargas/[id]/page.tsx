import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { Breadcrumb } from '@/shared/ui/breadcrumb/breadcrumb';
import { PageShell } from '@/shared/ui/page-shell/page-shell';
import { CargoDetailLoader } from '@/features/cargo-market/components/cargo-detail/cargo-detail-loader';
import { getCargoById } from '@/features/cargo/services/cargo.service';
import { translateMock } from '@/shared/i18n/mock-content';
import { normalizeCargoId } from '@/shared/routing/normalize-cargo-id';
import { getSessionUser } from '@/shared/server/auth';

type CargoDetailPageProps = {
  params: Promise<{
    id: string;
    locale: string;
  }>;
};

export default async function CargoDetailPage({ params }: CargoDetailPageProps) {
  const { id, locale } = await params;
  const normalizedCargoId = normalizeCargoId(id);

  const cargo = await getCargoById(normalizedCargoId);

  if (!cargo) {
    notFound();
  }

  const title = translateMock(locale, cargo.title);
  const user = await getSessionUser();
  const viewer = user ? { id: user.id, role: user.role, approved: user.approved } : null;
  const t = await getTranslations({ locale, namespace: 'pages.cargoDetail' });
  const nav = await getTranslations({ locale, namespace: 'nav' });
  const common = await getTranslations({ locale, namespace: 'common' });
  const routeDescription = `${cargo.origin}${common('routeArrow')}${cargo.destination}`;

  return (
    <PageShell eyebrow={t('eyebrow')} title={title} description={routeDescription}>
      <Breadcrumb
        locale={locale}
        items={[
          { label: nav('cargoes'), href: `/${locale}/cargas` },
          { label: title },
        ]}
      />
      <CargoDetailLoader id={normalizedCargoId} initialCargo={cargo} viewer={viewer} />
    </PageShell>
  );
}
