'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

import type { Cargo } from '@/features/marketplace/domain/marketplace.types';
import type { HydrowayMapModel } from '@/features/waterway-map/domain/hydroway-map-model.types';

const DESKTOP_MAP_MIN_WIDTH_PX = 901;

const DesktopCargoMapExpandedPage = dynamic(
  () =>
    import('@/features/dashboard/components/operations-board/desktop-cargo-map').then(
      (module) => module.DesktopCargoMapExpandedPage,
    ),
  { ssr: false },
);

const MobileHydrowayMapExperience = dynamic(
  () =>
    import('@/features/waterway-map/components/mobile/mobile-hydroway-map-experience').then(
      (module) => module.MobileHydrowayMapExperience,
    ),
  { ssr: false },
);

type CargoMapViewportRouterProps = {
  cargo: Cargo;
  model: HydrowayMapModel;
};

function readDesktopMapViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(`(min-width: ${DESKTOP_MAP_MIN_WIDTH_PX}px)`).matches;
}

export function CargoMapViewportRouter({ cargo, model }: CargoMapViewportRouterProps) {
  const [isDesktopViewport, setIsDesktopViewport] = useState(readDesktopMapViewport);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(min-width: ${DESKTOP_MAP_MIN_WIDTH_PX}px)`);
    const syncViewport = () => setIsDesktopViewport(mediaQuery.matches);

    syncViewport();
    mediaQuery.addEventListener('change', syncViewport);
    return () => mediaQuery.removeEventListener('change', syncViewport);
  }, []);

  if (isDesktopViewport) {
    return <DesktopCargoMapExpandedPage cargo={cargo} model={model} />;
  }

  return <MobileHydrowayMapExperience cargo={cargo} model={model} />;
}
