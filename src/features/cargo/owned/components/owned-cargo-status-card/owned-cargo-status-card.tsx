'use client';

import { useLocale, useTranslations } from 'next-intl';
import type { Cargo } from '@/features/marketplace/domain/marketplace.types';
import type { OwnedCargoStatusCardData } from '@/features/cargo/domain/derive-owned-cargo-detail';
import { translateMock } from '@/shared/i18n/mock-content';
import styles from './owned-cargo-status-card.module.sass';

type OwnedCargoStatusCardProps = {
  cargo: Cargo;
  statusCard: OwnedCargoStatusCardData;
};

export function OwnedCargoStatusCard({ cargo, statusCard }: OwnedCargoStatusCardProps) {
  const tCommon = useTranslations('common');
  const t = useTranslations('pages.minhasCargas.detail.statusCard');
  const locale = useLocale();

  const currentStep = statusCard.currentStepMock
    ? translateMock(locale, statusCard.currentStepMock)
    : null;
  const primaryAlert = statusCard.primaryAlertMock
    ? translateMock(locale, statusCard.primaryAlertMock)
    : null;

  return (
    <section className={styles.root} aria-label={t('aria')} data-testid="owned-cargo-status-card">
      <div className={styles.header}>
        <span className={styles.badge}>{tCommon(`cargoStatus.${cargo.status}`)}</span>
        <span className={styles.progressLabel}>
          {t('progressLabel', { progress: statusCard.progressPercent })}
        </span>
      </div>

      <div className={styles.progressTrack} role="progressbar" aria-valuenow={statusCard.progressPercent} aria-valuemin={0} aria-valuemax={100} aria-label={t('progressAria', { progress: statusCard.progressPercent })}>
        <span className={styles.progressFill} style={{ width: `${statusCard.progressPercent}%` }} />
      </div>

      {currentStep ? (
        <div className={styles.stepBlock}>
          <span className={styles.stepLabel}>{t('currentStepLabel')}</span>
          <p className={styles.stepText}>{currentStep}</p>
        </div>
      ) : null}

      {primaryAlert ? (
        <p className={styles.alert} data-tone="attention">
          <span className={styles.alertLabel}>{t('alertLabel')}</span>
          {primaryAlert}
        </p>
      ) : (
        <p className={styles.alert} data-tone="clear">
          {t('noAlert')}
        </p>
      )}

      <div className={styles.metaRow}>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>{t('windowLabel')}</span>
          <strong className={styles.metaValue}>{statusCard.windowLabel}</strong>
        </div>
        {statusCard.etaLabel ? (
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>{t('etaLabel')}</span>
            <strong className={styles.metaValue}>{statusCard.etaLabel}</strong>
          </div>
        ) : null}
      </div>
    </section>
  );
}
