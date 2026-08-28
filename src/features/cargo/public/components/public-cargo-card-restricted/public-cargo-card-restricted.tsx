'use client';

import type { ComponentType } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/core/i18n/navigation';
import type { PublicCargoSafeView } from '@/features/cargo/public/domain/public-cargo-types';
import { RiskBadge } from '@/features/cargo/components/risk-badge/risk-badge';

import styles from './public-cargo-card-restricted.module.sass';

export type PublicCargoActionButtonProps = {
  label: string;
  href?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'default' | 'compact';
};

type PublicCargoCardRestrictedProps = {
  cargo: PublicCargoSafeView;
  ActionButton: ComponentType<PublicCargoActionButtonProps>;
};

export function PublicCargoCardRestricted({ cargo, ActionButton }: PublicCargoCardRestrictedProps) {
  const t = useTranslations('shipperMobileFlow.publicCargo');

  return (
    <article className={styles.card}>
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
      <ActionButton label={t('manifestInterest')} href="/registrar" variant="secondary" size="compact" />
    </article>
  );
}
