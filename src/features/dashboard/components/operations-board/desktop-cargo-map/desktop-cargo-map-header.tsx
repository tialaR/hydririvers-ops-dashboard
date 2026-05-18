'use client';

import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/core/i18n/navigation';
import type { Cargo, CargoStatus } from '@/features/marketplace/domain/marketplace.types';
import { intlAppPaths } from '@/shared/routing/app-routes';
import styles from './desktop-cargo-map.module.scss';

type DesktopCargoMapHeaderProps = {
  cargo: Cargo;
};

function statusToneClass(status: CargoStatus) {
  return styles[`status_${status}` as keyof typeof styles] ?? styles.status_open;
}

export function DesktopCargoMapHeader({ cargo }: DesktopCargoMapHeaderProps) {
  const tBoard = useTranslations('operationsBoard');
  const tCommon = useTranslations('common');

  return (
    <header className={styles.header}>
      <Link
        href={intlAppPaths.cargos.marketplace}
        className={styles.backLink}
        aria-label={tBoard('map.closeExpanded')}
      >
        <ArrowLeft size={18} strokeWidth={2.2} aria-hidden />
        <span>{tCommon('previous')}</span>
      </Link>

      <div className={styles.metaRow}>
        <strong className={styles.cargoId}>{cargo.id}</strong>
        <span className={statusToneClass(cargo.status)}>{tCommon(`cargoStatus.${cargo.status}`)}</span>
      </div>
    </header>
  );
}
