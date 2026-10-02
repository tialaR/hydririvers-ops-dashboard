import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { Breadcrumb } from '@/shared/ui/breadcrumb/breadcrumb';
import { PageShell } from '@/shared/ui/page-shell/page-shell';
import { CargoDetailLoader } from '@/features/cargo-market/components/cargo-detail/cargo-detail-loader';
import { getCargoById } from '@/features/cargo/services/cargo.service';
import { getPublicCargoById } from '@/features/cargo/public/application/get-public-cargo-by-id';
import { translateMock } from '@/shared/i18n/mock-content';
import { normalizeCargoId } from '@/shared/routing/normalize-cargo-id';
import { getSessionUser } from '@/shared/server/auth';

import { AnonymousPublicCargoDetailExperience } from '../anonymous-public-cargo-detail-experience';

type CargoDetailPageProps = {
  params: Promise<{
    id: string;
    locale: string;
  }>;
};

export default async function CargoDetailPage({ params }: CargoDetailPageProps) {
  const { id, locale } = await params;
  const normalizedCargoId = normalizeCargoId(id);
  const user = await getSessionUser();
  const nav = await getTranslations({ locale, namespace: 'nav' });
  const common = await getTranslations({ locale, namespace: 'common' });

  if (!user) {
    const cargo = await getPublicCargoById(normalizedCargoId);

    if (!cargo) {
      notFound();
    }

    const publicCargo = await getTranslations({ locale, namespace: 'shipperMobileFlow.publicCargo' });
    const publicDetail = await getTranslations({ locale, namespace: 'shipperMobileFlow.publicCargoDetail' });
    const title = publicCargo(`cargoTypes.${cargo.cargoTypeKey}`);
    const routeDescription = `${cargo.origin}${common('routeArrow')}${cargo.destination}`;

    return (
      <PageShell eyebrow={publicDetail('title')} title={title} description={routeDescription}>
        <Breadcrumb
          locale={locale}
          items={[
            { label: nav('cargoes'), href: `/${locale}/cargas` },
            { label: title },
          ]}
        />
        <AnonymousPublicCargoDetailExperience cargo={cargo} />
      </PageShell>
    );
  }

  const cargo = await getCargoById(normalizedCargoId);

  if (!cargo) {
    notFound();
  }

  const title = translateMock(locale, cargo.title);
  const viewer = { id: user.id, role: user.role, approved: user.approved };
  const t = await getTranslations({ locale, namespace: 'pages.cargoDetail' });
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
