'use client';

import { useTranslations } from 'next-intl';

import { Link } from '@/core/i18n/navigation';
import type { OwnedCargoDesktopViewModel } from '@/features/cargo/owned/application/owned-cargo-desktop-view-model';
import { intlAppPaths } from '@/shared/routing/app-routes';
import styles from '@/features/cargo/owned/screens/owned-cargo-desktop-foundation.module.sass';

type OwnedCargoAttentionPanelProps = { viewModel: OwnedCargoDesktopViewModel };

export function OwnedCargoAttentionPanel({ viewModel }: OwnedCargoAttentionPanelProps) {
  const t = useTranslations('shipperMobileFlow');
  const { cargo, attention } = viewModel;

  return <section className={styles.alert} data-testid="page61-attention-panel" aria-label={t('myCargoes.desktop.attentionTitle')}>
    <div className={styles.alertCopy}>
      <small>{attention.eyebrow}</small>
      <strong>{attention.title}</strong>
      <span>{attention.body}</span>
      <div className={styles.alertContext}>
        <i>{attention.document}</i>
        <i>{attention.deadline}</i>
      </div>
    </div>
    <Link href={`${intlAppPaths.cargos.myCargoDetail(cargo.id)}/documentos`}>{attention.action}</Link>
  </section>;
}
