'use client';

import type { Cargo } from '@/features/marketplace/domain/marketplace.types';
import { DesktopCargoMapCanvas } from './desktop-cargo-map-canvas';
import { DesktopCargoMapHeader } from './desktop-cargo-map-header';
import styles from './desktop-cargo-map.module.scss';

type DesktopCargoMapExpandedPageProps = {
  cargo: Cargo;
};

export function DesktopCargoMapExpandedPage({ cargo }: DesktopCargoMapExpandedPageProps) {
  return (
    <div className={styles.page}>
      <DesktopCargoMapHeader cargo={cargo} />
      <DesktopCargoMapCanvas key={cargo.id} cargo={cargo} />
    </div>
  );
}
