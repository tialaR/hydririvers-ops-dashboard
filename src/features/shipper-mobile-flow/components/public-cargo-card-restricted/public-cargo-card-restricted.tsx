'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/core/i18n/navigation';
import type { PublicCargoSafeView } from '@/features/shipper-mobile-flow/domain/public-cargo-privacy-domain';
import { RiskBadge } from '@/features/shipper-mobile-flow/components/risk-badge/risk-badge';
import { PrimaryButton } from '@/features/shipper-mobile-flow/components/primary-button/primary-button';

import styles from '../cargo-card/cargo-card.module.sass';

type PublicCargoCardRestrictedProps = {
  cargo: PublicCargoSafeView;
};

export function PublicCargoCardRestricted({ cargo }: PublicCargoCardRestrictedProps) {
  const t = useTranslations('shipperMobileFlow.publicCargo');

  return (
    <article className={`${styles.card} ${styles.publicCard}`}>
      <Link href={`/cargas-publicas/${cargo.id}`} className={styles.header}>
        <div>
          <p className={styles.code}>{t(`cargoTypes.${cargo.cargoTypeKey}`)}</p>
          <p className={styles.route}>
            {cargo.origin} → {cargo.destination}
          </p>
        </div>
        <RiskBadge level={cargo.riskLevel} />
      </Link>
      <p className={styles.restricted}>{t('restrictedNotice')}</p>
      <p className={styles.publicStatus}>
        {t(`windows.${cargo.windowLabelKey}`)} · {t(`status.${cargo.statusKey}`)}
      </p>
      <PrimaryButton label={t('manifestInterest')} href="/registrar" variant="secondary" size="compact" />
    </article>
  );
}
