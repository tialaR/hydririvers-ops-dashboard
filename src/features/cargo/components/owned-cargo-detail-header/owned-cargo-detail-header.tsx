'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/core/i18n/navigation';
import { intlAppPaths } from '@/shared/routing/app-routes';
import { HydroIcon } from '@/shared/ui/hydro-icon/hydro-icon';
import type { Cargo } from '@/features/marketplace/domain/marketplace.types';
import { translateMock } from '@/shared/i18n/mock-content';
import styles from './owned-cargo-detail-header.module.sass';

function statusTone(status: Cargo['status']): 'success' | 'warning' | 'river' {
  if (status === 'reserved' || status === 'delivered') return 'success';
  if (status === 'contracting' || status === 'boarded') return 'warning';
  return 'river';
}

export function OwnedCargoDetailHeader({ cargo }: { cargo: Cargo }) {
  const tCommon = useTranslations('common');
  const tDetail = useTranslations('pages.minhasCargas.detail');
  const locale = useLocale();

  const title = translateMock(locale, cargo.title);
  const nextStep = cargo.operationalNextStep ? translateMock(locale, cargo.operationalNextStep) : null;

  return (
    <header className={styles.root} data-testid="owned-cargo-detail-header">
      <div className={styles.topRow}>
        <Link
          href={intlAppPaths.cargos.myCargos}
          className={styles.backLink}
          aria-label={tDetail('backAria')}
        >
          <HydroIcon name="chevronDown" size={18} aria-hidden className={styles.backIcon} />
          <span>{tDetail('backLabel')}</span>
        </Link>
        <span className={styles.code}>{cargo.id}</span>
      </div>

      <h1 className={styles.title}>{title}</h1>

      <p className={styles.route}>
        <span>{cargo.origin}</span>
        <HydroIcon name="ship" size={14} aria-hidden className={styles.routeIcon} />
        <span>{cargo.destination}</span>
      </p>

      <div className={styles.statusRow}>
        <span className={styles.statusChip} data-tone={statusTone(cargo.status)}>
          {tCommon(`cargoStatus.${cargo.status}`)}
        </span>
        <span className={styles.categoryChip}>
          {cargo.temperature ? `${cargo.cargoType} · ${cargo.temperature}` : cargo.cargoType}
        </span>
      </div>

      {nextStep ? (
        <div className={styles.nextStepBlock}>
          <span className={styles.nextStepLabel}>{tDetail('nextStepLabel')}</span>
          <p className={styles.nextStepText}>{nextStep}</p>
        </div>
      ) : null}
    </header>
  );
}
