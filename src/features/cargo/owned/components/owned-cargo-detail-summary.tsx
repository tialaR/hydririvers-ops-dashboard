'use client';

import { Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link } from '@/core/i18n/navigation';
import { OwnedCargoAttentionPanel } from '@/features/cargo/owned/components/owned-cargo-attention-panel';
import type { CargoCorridorId, OwnedCargo } from '@/features/cargo/owned/domain/owned-cargo-types';
import { page61219254SelectedVisualFacts } from '@/features/cargo/owned/fixtures/page-61-219-254.visual-fixture';
import { intlAppPaths } from '@/shared/routing/app-routes';
import styles from '@/features/cargo/owned/screens/owned-cargo-desktop-foundation.module.sass';

const corridorTranslationKey: Record<CargoCorridorId, 'amazonasSolimoes' | 'madeira' | 'tapajos' | 'tocantinsAraguaia'> = {
  'amazonas-solimoes': 'amazonasSolimoes', madeira: 'madeira', tapajos: 'tapajos', 'tocantins-araguaia': 'tocantinsAraguaia'
};

type OwnedCargoDetailSummaryProps = { cargo: OwnedCargo; visualFixtureEnabled: boolean };

export function OwnedCargoDetailSummary({ cargo, visualFixtureEnabled }: OwnedCargoDetailSummaryProps) {
  const t = useTranslations('shipperMobileFlow');
  const status = t(`cargoDetail.status.${cargo.status}`);

  return <div className={styles.body}>
    <article className={styles.overview}>
      <header className={styles.title}>
        <div><small>{t('myCargoes.desktop.selectedCargo')}</small><h2>#{cargo.code}</h2></div>
        <div className={styles.operationState}>
          <span>{status}</span><b>{visualFixtureEnabled ? page61219254SelectedVisualFacts.progress : t('myCargoes.desktop.updated', { minutes: cargo.freshnessMinutes })}</b><strong>{t('myCargoes.desktop.eta', { hours: cargo.etaHours })}</strong>
        </div>
      </header>

      <section className={styles.fixtureCarrier}>
        <span>NA</span>
        <div><strong>{visualFixtureEnabled ? page61219254SelectedVisualFacts.carrier : t(`map.corridors.${corridorTranslationKey[cargo.corridorId]}`)}</strong><small>{visualFixtureEnabled ? `${page61219254SelectedVisualFacts.vessel} · ${page61219254SelectedVisualFacts.carrierReference}` : `${cargo.origin} → ${cargo.destination}`}</small></div>
        <i>{t('myCargoes.desktop.corridor')}</i>
        <Link href={intlAppPaths.cargos.myCargoDetail(cargo.id)}>{t('myCargoes.desktop.openCockpit')}</Link>
      </section>

      <section className={styles.cargoDetails} aria-label={t('cargoDetail.opsSectionAria')}>
        <h3>{t('myCargoes.desktop.selectedCargo')}</h3>
        <div className={styles.grid}>
          <section><small>{t('myCargoes.desktop.cargo')}</small><strong>{visualFixtureEnabled ? page61219254SelectedVisualFacts.cargoType : cargo.origin}</strong></section>
          <section><small>{t('myCargoes.desktop.volume')}</small><strong>{visualFixtureEnabled ? page61219254SelectedVisualFacts.totalWeight : t('myCargoes.desktop.offers', { count: cargo.offersCount })}</strong></section>
          <section><small>{t('myCargoes.desktop.vessel')}</small><strong>{visualFixtureEnabled ? page61219254SelectedVisualFacts.vessel : t(`map.corridors.${corridorTranslationKey[cargo.corridorId]}`)}</strong></section>
          <section><small>{t('myCargoes.desktop.status')}</small><strong>{visualFixtureEnabled ? page61219254SelectedVisualFacts.progress : status}</strong></section>
        </div>
      </section>

      <section className={styles.facts}>
        <div><small>{visualFixtureEnabled ? 'SINAL' : t('myCargoes.desktop.freshnessLabel')}</small><strong>{visualFixtureEnabled ? page61219254SelectedVisualFacts.signal : t(`myCargoes.desktop.freshness.${cargo.freshnessState}`)}</strong><span>{t('myCargoes.desktop.updated', { minutes: cargo.freshnessMinutes })}</span></div>
        <div><small>{visualFixtureEnabled ? 'RIO' : t('myCargoes.desktop.corridor')}</small><strong>{visualFixtureEnabled ? page61219254SelectedVisualFacts.river : t(`map.corridors.${corridorTranslationKey[cargo.corridorId]}`)}</strong><span>{t(`map.corridors.${corridorTranslationKey[cargo.corridorId]}`)}</span></div>
        <div><small>{t('myCargoes.desktop.nextMilestone')}</small><strong>{visualFixtureEnabled ? page61219254SelectedVisualFacts.nextMilestone : t('myCargoes.desktop.checkpoint')}</strong><span>{visualFixtureEnabled ? page61219254SelectedVisualFacts.nextMilestoneTime : t('myCargoes.desktop.checkpointHint')}</span></div>
      </section>

      <OwnedCargoAttentionPanel cargo={cargo}/>
    </article>

    {!visualFixtureEnabled ? <aside className={styles.intelligence}>
      <h3><Sparkles size={15}/>{t('myCargoes.desktop.intelligence')}</h3>
      <section><small>{t('myCargoes.desktop.riskLabel')}</small><strong>{t(`myCargoes.desktop.risk.${cargo.riskLevel}`)}</strong><span>{t('myCargoes.desktop.riskHint')}</span></section>
      <section><small>{t('myCargoes.desktop.nextMilestone')}</small><strong>{t('myCargoes.desktop.checkpoint')}</strong><span>{t('myCargoes.desktop.checkpointHint')}</span></section>
      <section><small>{t('myCargoes.desktop.recommendedAction')}</small><strong>{t('myCargoes.desktop.reviewDocs')}</strong><span>{t('myCargoes.desktop.recommendedHint')}</span></section>
    </aside> : null}
  </div>;
}
