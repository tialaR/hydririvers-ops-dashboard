import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { Breadcrumb } from '@/shared/ui/breadcrumb/breadcrumb';
import { PageShell } from '@/shared/ui/page-shell/page-shell';
import { CargoDetailLoader } from '@/features/cargo-market/components/cargo-detail/cargo-detail-loader';
import { getCargoById } from '@/features/cargo/services/cargo.service';
import { createCargoWaterwayTrackingScenario } from '@/features/waterway-tracking';
import { translateMock } from '@/shared/i18n/mock-content';
import { intlAppPaths } from '@/shared/routing/app-routes';
import { normalizeCargoId } from '@/shared/routing/normalize-cargo-id';
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

type CargoTrackingScenarioInput = Parameters<typeof createCargoWaterwayTrackingScenario>[0];

const VISUAL_OVERVIEW_VIEW = 'visao-geral';
const CARGO_PRIORITY_LEVEL_TO_TRACKING_PRIORITY = {
  monitoring: 'low',
  medium: 'normal',
  high: 'high',
} as const;

function getStableCargoIndex(cargoId: string) {
  const match = cargoId.match(/\d+/);
  const parsed = match ? Number.parseInt(match[0], 10) : 1;

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function buildVisualOverviewFallbackInput(cargoId: string): CargoTrackingScenarioInput {
  const index = getStableCargoIndex(cargoId);

  const corridors = [
    {
      corridor: 'Corredor Amazonas',
      mainRiver: 'Rio Amazonas',
      origin: 'Terminal Manaus Norte',
      destination: 'Terminal Santarém Oeste',
      cargoType: 'Carga conteinerizada',
    },
    {
      corridor: 'Corredor Madeira',
      mainRiver: 'Rio Madeira',
      origin: 'Terminal Porto Velho',
      destination: 'Terminal Itacoatiara',
      cargoType: 'Granel agrícola',
    },
    {
      corridor: 'Corredor Tapajós',
      mainRiver: 'Rio Tapajós',
      origin: 'Terminal Miritituba',
      destination: 'Terminal Santarém',
      cargoType: 'Carga geral',
    },
    {
      corridor: 'Corredor Tocantins',
      mainRiver: 'Rio Tocantins',
      origin: 'Terminal Marabá',
      destination: 'Terminal Vila do Conde',
      cargoType: 'Carga industrial',
    },
  ];

  const statuses = ['open', 'bidding', 'reserved', 'boarded'] as const;
  const priorities = ['low', 'normal', 'high'] as const;

  const corridor = corridors[(index - 1) % corridors.length];
  const progressSeed = 18 + ((index * 17) % 68);

  return {
    cargoId,
    title: cargoId,
    cargoType: corridor.cargoType,
    co2Saving: `${18 + ((index * 7) % 31)}%`,
    connectivity: `${72 + ((index * 5) % 24)}%`,
    corridor: corridor.corridor,
    documentReadiness: `${66 + ((index * 9) % 31)}%`,
    etaConfidence: `${70 + ((index * 6) % 25)}%`,
    mainRiver: corridor.mainRiver,
    origin: corridor.origin,
    destination: corridor.destination,
    priority: priorities[(index - 1) % priorities.length],
    status: statuses[(index - 1) % statuses.length],
    targetPrice: `R$ ${(120000 + index * 18500).toLocaleString('pt-BR')}`,
    window: `${Math.max(12, progressSeed)}h operacionais`,
  } as unknown as CargoTrackingScenarioInput;
}

export default async function CargoDetailPage({
  params,
  searchParams,
}: CargoDetailPageProps) {
  const { id, locale } = await params;
  const normalizedCargoId = normalizeCargoId(id);
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const currentView = resolvedSearchParams.view;

  const cargo = await getCargoById(normalizedCargoId);
  const title = cargo ? translateMock(locale, cargo.title) : normalizedCargoId;

  if (currentView === VISUAL_OVERVIEW_VIEW) {
    const trackingPriority = cargo?.priority
      ? CARGO_PRIORITY_LEVEL_TO_TRACKING_PRIORITY[cargo.priority.level]
      : undefined;

    const trackingScenario = createCargoWaterwayTrackingScenario(
      cargo
        ? {
            cargoId: normalizedCargoId,
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
          }
        : buildVisualOverviewFallbackInput(normalizedCargoId),
    );

    return (
      <CargoMapImmersiveClient
        locale={locale}
        cargoId={normalizedCargoId}
        trackingScenario={trackingScenario}
      />
    );
  }

  if (!cargo) {
    notFound();
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
          { label: nav('cargoes'), href: `/${locale}/cargas` },
          { label: title },
        ]}
      />
      <CargoDetailLoader id={normalizedCargoId} initialCargo={cargo} viewer={viewer} />
    </PageShell>
  );
}
