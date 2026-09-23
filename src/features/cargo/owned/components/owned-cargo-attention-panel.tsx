'use client';

import { useTranslations } from 'next-intl';

import { Link } from '@/core/i18n/navigation';
import type { OwnedCargo } from '@/features/cargo/owned/domain/owned-cargo-types';
import { page61219254SelectedVisualFacts } from '@/features/cargo/owned/fixtures/page-61-219-254.visual-fixture';
import { intlAppPaths } from '@/shared/routing/app-routes';
import styles from '@/features/cargo/owned/screens/owned-cargo-desktop-foundation.module.sass';

type OwnedCargoAttentionPanelProps = { cargo: OwnedCargo; visualFixtureEnabled: boolean };

export function OwnedCargoAttentionPanel({ cargo, visualFixtureEnabled }: OwnedCargoAttentionPanelProps) {
  const t = useTranslations('shipperMobileFlow');
  const eyebrow = visualFixtureEnabled ? page61219254SelectedVisualFacts.attentionEyebrow : t('myCargoes.desktop.attentionTitle');
  const title = visualFixtureEnabled ? page61219254SelectedVisualFacts.attentionTitle : t('myCargoes.desktop.attentionBody');
  const body = visualFixtureEnabled ? page61219254SelectedVisualFacts.attentionBody : t('myCargoes.desktop.recommendedHint');
  const document = visualFixtureEnabled ? page61219254SelectedVisualFacts.attentionDocument : t('myCargoes.desktop.docs', { count: cargo.pendingDocsCount });
  const deadline = visualFixtureEnabled ? page61219254SelectedVisualFacts.attentionDeadline : t('myCargoes.desktop.eta', { hours: cargo.etaHours });
  const action = visualFixtureEnabled ? page61219254SelectedVisualFacts.attentionAction : t('myCargoes.desktop.review');

  return <section className={styles.alert} data-testid="page61-attention-panel" aria-label={t('myCargoes.desktop.attentionTitle')}>
    <div className={styles.alertCopy}>
      <small>{eyebrow}</small>
      <strong>{title}</strong>
      <span>{body}</span>
      <div className={styles.alertContext}>
        <i>{document}</i>
        <i>{deadline}</i>
      </div>
    </div>
    <Link href={`${intlAppPaths.cargos.myCargoDetail(cargo.id)}/documentos`}>{action}</Link>
  </section>;
}
