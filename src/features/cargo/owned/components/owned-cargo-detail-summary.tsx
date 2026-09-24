'use client';

import { useTranslations } from 'next-intl';

import { Link } from '@/core/i18n/navigation';
import type { OwnedCargoDesktopViewModel } from '@/features/cargo/owned/application/owned-cargo-desktop-view-model';
import { OwnedCargoAttentionPanel } from '@/features/cargo/owned/components/owned-cargo-attention-panel';
import { intlAppPaths } from '@/shared/routing/app-routes';
import styles from '@/features/cargo/owned/screens/owned-cargo-desktop-foundation.module.sass';

type OwnedCargoDetailSummaryProps = { viewModel: OwnedCargoDesktopViewModel };

export function OwnedCargoDetailSummary({ viewModel }: OwnedCargoDetailSummaryProps) {
  const t = useTranslations('shipperMobileFlow');
  const { cargo } = viewModel;

  return <div className={styles.body}>
    <article className={styles.overview}>
      <header className={styles.title}>
        <div><small>{t('myCargoes.desktop.selectedCargo')}</small><h2>{viewModel.codeLabel}</h2></div>
        <div className={styles.operationState}>
          <span>{viewModel.statusLabel}</span><b>{viewModel.progressLabel}</b><strong>{viewModel.cardEta}</strong>
        </div>
      </header>

      <section className={styles.canonicalCarrier}>
        <span>NA</span>
        <div><strong>{viewModel.carrier}</strong><small>{viewModel.vessel} · {viewModel.carrierReference}</small></div>
        <i>{viewModel.carrierRole}</i>
        <Link href={intlAppPaths.cargos.myCargoDetail(cargo.id)}>{t('myCargoes.desktop.openCockpit')}</Link>
      </section>

      <section className={styles.cargoDetails} aria-label={t('cargoDetail.opsSectionAria')}>
        <h3>Detalhes da carga</h3>
        <div className={styles.grid}>
          <section><small>{t('myCargoes.desktop.cargo')}</small><strong>{viewModel.cargoType}</strong></section>
          <section><small>{t('myCargoes.desktop.volume')}</small><strong>{viewModel.totalWeight}</strong></section>
          <section><small>{t('myCargoes.desktop.vessel')}</small><strong>{viewModel.vessel}</strong></section>
          <section><small>{t('myCargoes.desktop.status')}</small><strong>{viewModel.progressLabel} concluído</strong></section>
        </div>
      </section>

      <section className={styles.facts}>
        <div><small>SINAL</small><strong>{viewModel.signal}</strong><span>{viewModel.signalDetail}</span></div>
        <div><small>RIO</small><strong>{viewModel.river}</strong><span>{viewModel.riverDetail}</span></div>
        <div><small>{t('myCargoes.desktop.nextMilestone')}</small><strong>{viewModel.nextMilestone}</strong><span>{viewModel.nextMilestoneTime}</span></div>
      </section>

      <OwnedCargoAttentionPanel viewModel={viewModel}/>
    </article>
  </div>;
}
