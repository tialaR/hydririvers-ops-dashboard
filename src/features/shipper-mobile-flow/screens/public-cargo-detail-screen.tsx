'use client';

import { useTranslations } from 'next-intl';
import { MobileAppShell } from '@/features/shipper-mobile-flow/components/mobile-app-shell/mobile-app-shell';
import { PrimaryButton } from '@/features/shipper-mobile-flow/components/primary-button/primary-button';
import { RiskBadge } from '@/features/shipper-mobile-flow/components/risk-badge/risk-badge';
import {
  resolvePublicCorridorI18nKey,
  type PublicCargoSafeView
} from '@/features/shipper-mobile-flow/domain/public-cargo-privacy-domain';

import styles from '../components/shared-ui/shared-ui.module.sass';

type PublicCargoDetailScreenProps = {
  cargo: PublicCargoSafeView;
};

export function PublicCargoDetailScreen({ cargo }: PublicCargoDetailScreenProps) {
  const t = useTranslations('shipperMobileFlow.publicCargoDetail');
  const tCargo = useTranslations('shipperMobileFlow.publicCargo');
  const tCorridors = useTranslations('shipperMobileFlow.corridors');

  const corridorLabel = tCorridors(resolvePublicCorridorI18nKey(cargo.corridorId));

  return (
    <MobileAppShell title={t('title')} backHref="/cargas-publicas">
      <article className={styles.publicDetailHero}>
        <div className={styles.publicDetailHeader}>
          <div>
            <p className={styles.publicDetailType}>{tCargo(`cargoTypes.${cargo.cargoTypeKey}`)}</p>
            <h2 className={styles.publicDetailRoute}>
              {cargo.origin} → {cargo.destination}
            </h2>
          </div>
          <RiskBadge level={cargo.riskLevel} />
        </div>
        <p className={styles.publicDetailMeta}>
          {corridorLabel} · {tCargo(`windows.${cargo.windowLabelKey}`)}
        </p>
        <p className={styles.publicDetailStatus}>{tCargo(`status.${cargo.statusKey}`)}</p>
        <p className={styles.publicDetailPrivacy}>{t('privacyBody')}</p>
      </article>

      <div className={styles.publicDetailFacts}>
        <div className={styles.publicDetailFact}>
          <span className={styles.tileLabel}>{t('facts.corridor')}</span>
          <span className={styles.tileValue}>{corridorLabel}</span>
        </div>
        <div className={styles.publicDetailFact}>
          <span className={styles.tileLabel}>{t('facts.window')}</span>
          <span className={styles.tileValue}>{tCargo(`windows.${cargo.windowLabelKey}`)}</span>
        </div>
        <div className={styles.publicDetailFact}>
          <span className={styles.tileLabel}>{t('facts.risk')}</span>
          <RiskBadge level={cargo.riskLevel} />
        </div>
        <div className={styles.publicDetailFact}>
          <span className={styles.tileLabel}>{t('facts.status')}</span>
          <span className={styles.tileValue}>{tCargo(`status.${cargo.statusKey}`)}</span>
        </div>
      </div>

      <div className={styles.publicDetailActions}>
        <PrimaryButton label={t('manifestInterest')} href="/registrar" />
        <PrimaryButton label={t('createAccount')} href="/registrar" variant="secondary" />
      </div>
    </MobileAppShell>
  );
}
