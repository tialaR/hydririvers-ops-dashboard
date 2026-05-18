import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import { HydrowayMapSpikeShell } from '@/features/waterway-map';
import { isHydrowayMapLibreSpikeRouteEnabled } from '@/shared/config/env';

type HydrowayMapSpikePageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function HydrowayMapSpikePage({ params }: HydrowayMapSpikePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  if (!isHydrowayMapLibreSpikeRouteEnabled()) {
    notFound();
  }

  return <HydrowayMapSpikeShell />;
}
