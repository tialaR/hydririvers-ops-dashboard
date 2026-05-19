import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import { HydrowayMapSpikeShell } from '@/features/waterway-map';
import { resolveSpikeHydrowayMapModel } from '@/features/waterway-map/data/resolve-spike-hydroway-model';
import { isHydrowayMapLibreSpikeRouteEnabled } from '@/shared/config/env';

type HydrowayMapSpikePageProps = {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    cargoId?: string;
  }>;
};

export default async function HydrowayMapSpikePage({ params, searchParams }: HydrowayMapSpikePageProps) {
  const { locale } = await params;
  const { cargoId } = await searchParams;
  setRequestLocale(locale);

  if (!isHydrowayMapLibreSpikeRouteEnabled()) {
    notFound();
  }

  const model = resolveSpikeHydrowayMapModel(cargoId);

  return <HydrowayMapSpikeShell model={model} />;
}
