'use client';

import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/core/i18n/navigation';
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
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(intlAppPaths.cargos.marketplace);
  };

  return (
    <header className={styles.header}>
      <button
        type="button"
        className={styles.backLink}
        aria-label={tBoard('map.closeExpanded')}
        onClick={handleBack}
      >
        <ArrowLeft size={18} strokeWidth={2.2} aria-hidden />
        <span>{tCommon('previous')}</span>
      </button>

      <div className={styles.metaRow}>
        <strong className={styles.cargoId}>{cargo.id}</strong>
        <span className={statusToneClass(cargo.status)}>{tCommon(`cargoStatus.${cargo.status}`)}</span>
      </div>
    </header>
  );
}
