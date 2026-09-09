'use client';

import dynamic from 'next/dynamic';

import type { Cargo } from '@/features/marketplace/domain/marketplace.types';
import type { HydrowayMapModel } from '@/features/waterway-map/domain/hydroway-map-model.types';

import { DesktopCargoMapHeader } from './desktop-cargo-map-header';
import styles from './desktop-cargo-map.module.scss';

const HydrowayMapProductShell = dynamic(
  () =>
    import('@/features/waterway-map/components/hydroway-map-product-shell').then(
      (module) => module.HydrowayMapProductShell,
    ),
  { ssr: false },
);

type DesktopCargoMapExpandedPageProps = {
  cargo: Cargo;
  model: HydrowayMapModel;
};

export function DesktopCargoMapExpandedPage({ cargo, model }: DesktopCargoMapExpandedPageProps) {
  return (
    <div className={styles.page}>
      <DesktopCargoMapHeader cargo={cargo} />
      <HydrowayMapProductShell key={model.cargoId} model={model} />
    </div>
  );
}
