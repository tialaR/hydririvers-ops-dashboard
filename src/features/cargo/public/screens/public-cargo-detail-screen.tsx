'use client';

import type { ComponentType } from 'react';
import { useTranslations } from 'next-intl';
import { RiskBadge } from '@/features/cargo/components/risk-badge/risk-badge';
import { resolvePublicCorridorI18nKey } from '@/features/cargo/public/domain/public-cargo-privacy';
import type { PublicCargoSafeView } from '@/features/cargo/public/domain/public-cargo-types';
import type { PublicCargoActionButtonProps } from '@/features/cargo/public/components/public-cargo-card-restricted/public-cargo-card-restricted';

import styles from '@/features/cargo/styles/cargo-flow.module.sass';

type PublicCargoDetailScreenProps = {
  cargo: PublicCargoSafeView;
  ActionButton: ComponentType<PublicCargoActionButtonProps>;
};

export function PublicCargoDetailScreen({ cargo, ActionButton }: PublicCargoDetailScreenProps) {
  const t = useTranslations('shipperMobileFlow.publicCargoDetail');
  const tCargo = useTranslations('shipperMobileFlow.publicCargo');
  const tCorridors = useTranslations('shipperMobileFlow.corridors');
  const corridorLabel = tCorridors(resolvePublicCorridorI18nKey(cargo.corridorId));

  return (
    <>
      <article className={styles.publicDetailHero}>
        <div className={styles.publicDetailHeader}>
          <div>
            <p className={styles.publicDetailType}>{tCargo(`cargoTypes.${cargo.cargoTypeKey}`)}</p>
            <h2 className={styles.publicDetailRoute}>{cargo.origin} → {cargo.destination}</h2>
          </div>
          <RiskBadge level={cargo.riskLevel} />
        </div>
        <p className={styles.publicDetailMeta}>{corridorLabel} · {tCargo(`windows.${cargo.windowLabelKey}`)}</p>
        <p className={styles.publicDetailStatus}>{tCargo(`status.${cargo.statusKey}`)}</p>
        <p className={styles.publicDetailPrivacy}>{t('privacyBody')}</p>
      </article>
      <div className={styles.publicDetailFacts}>
        <div className={styles.publicDetailFact}><span className={styles.tileLabel}>{t('facts.corridor')}</span><span className={styles.tileValue}>{corridorLabel}</span></div>
        <div className={styles.publicDetailFact}><span className={styles.tileLabel}>{t('facts.window')}</span><span className={styles.tileValue}>{tCargo(`windows.${cargo.windowLabelKey}`)}</span></div>
        <div className={styles.publicDetailFact}><span className={styles.tileLabel}>{t('facts.risk')}</span><RiskBadge level={cargo.riskLevel} /></div>
        <div className={styles.publicDetailFact}><span className={styles.tileLabel}>{t('facts.status')}</span><span className={styles.tileValue}>{tCargo(`status.${cargo.statusKey}`)}</span></div>
      </div>
      <div className={styles.publicDetailActions}>
        <ActionButton label={t('manifestInterest')} href="/registrar" />
        <ActionButton label={t('createAccount')} href="/registrar" variant="secondary" />
      </div>
    </>
  );
}
