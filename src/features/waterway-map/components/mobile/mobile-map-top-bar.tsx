'use client';

import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/core/i18n/navigation';

import type { Cargo, CargoStatus } from '@/features/marketplace/domain/marketplace.types';
import { intlAppPaths } from '@/shared/routing/app-routes';

import styles from './mobile-hydroway-map.module.scss';

type MobileMapTopBarProps = {
  cargo: Cargo;
  progressPercent: number;
  eta?: string;
};

function statusToneClass(status: CargoStatus) {
  return styles[`status_${status}` as keyof typeof styles] ?? styles.status_open;
}

export function MobileMapTopBar({ cargo, progressPercent, eta }: MobileMapTopBarProps) {
  const tMap = useTranslations('operationsBoard.map');
  const tCommon = useTranslations('common');

  return (
    <header className={styles.topBar} data-testid="hydroway-map-mobile-top-bar">
      <Link
        href={intlAppPaths.cargos.marketplace}
        className={styles.topBarBack}
        aria-label={tMap('mapBack')}
      >
        <ArrowLeft size={18} strokeWidth={2.2} aria-hidden />
      </Link>

      <div className={styles.topBarMain}>
        <strong className={styles.topBarCargoId}>{cargo.id}</strong>
        <span className={statusToneClass(cargo.status)}>{tCommon(`cargoStatus.${cargo.status}`)}</span>
      </div>

      <div className={styles.topBarMeta} aria-label={tMap('mapRouteProgress')}>
        <span className={styles.topBarProgress}>{progressPercent}%</span>
        {eta ? <span className={styles.topBarEta}>{eta}</span> : null}
      </div>
    </header>
  );
}
