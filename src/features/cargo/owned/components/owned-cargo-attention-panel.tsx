'use client';

import { useTranslations } from 'next-intl';

import { Link } from '@/core/i18n/navigation';
import type { OwnedCargo } from '@/features/cargo/owned/domain/owned-cargo-types';
import { intlAppPaths } from '@/shared/routing/app-routes';
import styles from '@/features/cargo/owned/screens/owned-cargo-desktop-foundation.module.sass';

type OwnedCargoAttentionPanelProps = { cargo: OwnedCargo };

export function OwnedCargoAttentionPanel({ cargo }: OwnedCargoAttentionPanelProps) {
  const t = useTranslations('shipperMobileFlow');

  return <section className={styles.alert} aria-label={t('myCargoes.desktop.attentionTitle')}>
    <div className={styles.alertCopy}>
      <small>{t('myCargoes.desktop.attentionTitle')}</small>
      <strong>{t('myCargoes.desktop.attentionBody')}</strong>
      <span>{t('myCargoes.desktop.recommendedHint')}</span>
      <div className={styles.alertContext}>
        <i>{t('myCargoes.desktop.docs', { count: cargo.pendingDocsCount })}</i>
        <i>{t('myCargoes.desktop.eta', { hours: cargo.etaHours })}</i>
      </div>
    </div>
    <Link href={`${intlAppPaths.cargos.myCargoDetail(cargo.id)}/documentos`}>{t('myCargoes.desktop.review')}</Link>
  </section>;
}
