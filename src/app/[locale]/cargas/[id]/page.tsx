import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { Breadcrumb } from '@/shared/ui/breadcrumb/breadcrumb';
import { PageShell } from '@/shared/ui/page-shell/page-shell';
import { CargoDetailLoader } from '@/features/cargo-market/components/cargo-detail/cargo-detail-loader';
import { getCargoById } from '@/features/marketplace/services/marketplace.service';
import { createCargoWaterwayTrackingScenario } from '@/features/waterway-tracking';
import { translateMock } from '@/shared/i18n/mock-content';
import { intlAppPaths } from '@/shared/routing/app-routes';
import { getSessionUser } from '@/shared/server/auth';

import CargoMapImmersiveClient from './cargo-map-immersive-client';

type CargoDetailPageProps = {
  params: Promise<{
    id: string;
    locale: string;
  }>;
  searchParams?: Promise<{
    view?: string;
  }>;
};

const VISUAL_OVERVIEW_VIEW = 'visao-geral';
const CARGO_PRIORITY_LEVEL_TO_TRACKING_PRIORITY = {
  monitoring: 'low',
  medium: 'normal',
  high: 'high',
} as const;

export default async function CargoDetailPage({
  params,
  searchParams,
}: CargoDetailPageProps) {
  const { id, locale } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const cargo = await getCargoById(id);

  if (!cargo) {
    notFound();
  }

  const title = translateMock(locale, cargo.title);
  const currentView = resolvedSearchParams.view;

  if (currentView === VISUAL_OVERVIEW_VIEW) {
    const trackingPriority = cargo.priority
      ? CARGO_PRIORITY_LEVEL_TO_TRACKING_PRIORITY[cargo.priority.level]
      : undefined;

    const trackingScenario = createCargoWaterwayTrackingScenario({
      cargoId: id,
      title,
      cargoType: cargo.cargoType,
      co2Saving: cargo.co2Saving,
      connectivity: cargo.connectivity,
      corridor: cargo.corridor,
      documentReadiness: cargo.documentReadiness,
      etaConfidence: cargo.etaConfidence,
      mainRiver: cargo.mainRiver,
      origin: cargo.origin,
      destination: cargo.destination,
      priority: trackingPriority,
      status: cargo.status,
      targetPrice: cargo.targetPrice,
      window: cargo.window,
    });

    return (
      <CargoMapImmersiveClient
        locale={locale}
        cargoId={id}
        trackingScenario={trackingScenario}
      />
    );
  }

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
          { label: nav('cargoes'), href: intlAppPaths.cargos.marketplace },
          { label: title },
        ]}
      />
      <CargoDetailLoader id={id} initialCargo={cargo} viewer={viewer} />
    </PageShell>
  );
}
