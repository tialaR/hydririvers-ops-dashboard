'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/core/i18n/navigation';
import { RiskBadge } from '@/features/cargo/components/risk-badge/risk-badge';
import { FreshnessIndicator } from '@/features/cargo/components/freshness-indicator/freshness-indicator';
import type { OwnedCargo } from '@/features/cargo/owned/domain/owned-cargo-types';

import styles from '@/features/cargo/styles/cargo-flow.module.sass';

type OwnedCargoDetailScreenProps = {
  cargo: OwnedCargo;
  mapPreview: ReactNode;
};

export function OwnedCargoDetailScreen({ cargo, mapPreview }: OwnedCargoDetailScreenProps) {
  const t = useTranslations('shipperMobileFlow.cargoDetail');
  const tStatus = useTranslations('shipperMobileFlow.cargoDetail.status');
  const detailFacts = [
    { key: 'eta', label: t('modules.eta'), value: t('modules.etaValue', { hours: cargo.etaHours }) },
    { key: 'docs', label: t('tiles.docs'), value: String(cargo.pendingDocsCount) },
    { key: 'offers', label: t('tiles.negotiation'), value: t('tiles.offers', { count: cargo.offersCount }) }
  ];
  const operationCards = [
    { key: 'timeline', label: t('modules.timeline'), value: t('modules.timelineValue') },
    { key: 'costs', label: t('modules.costs'), value: t('modules.costsValue') },
    { key: 'compliance', label: t('modules.compliance'), value: t('modules.complianceValue') },
    { key: 'portWindow', label: t('modules.portWindow'), value: t('modules.portWindowValue') },
    { key: 'eta', label: t('modules.eta'), value: t('modules.etaValue', { hours: cargo.etaHours }) },
    { key: 'risk', label: t('modules.risk'), value: t('modules.riskValue') },
  ];

  return (
    <>
      <article className={styles.detailRiskBanner}>
        <div className={styles.detailRiskHeader}>
          <div>
            <p className={styles.detailRiskLabel}>{t('tiles.risk')}</p>
            <h2 className={styles.detailRiskStatus}>{tStatus(cargo.status)}</h2>
          </div>
          <RiskBadge level={cargo.riskLevel} />
        </div>
        <FreshnessIndicator minutes={cargo.freshnessMinutes} state={cargo.freshnessState} />
        <p className={styles.detailRoute}>
          {cargo.origin} → {cargo.destination}
        </p>
      </article>
      {mapPreview}
      <section className={styles.detailFactsStrip} aria-label={t('opsSectionAria')}>
        {detailFacts.map((fact) => (
          <article key={fact.key} className={styles.detailFactCard}>
            <p className={styles.detailFactLabel}>{fact.label}</p>
            <p className={styles.detailFactValue}>{fact.value}</p>
          </article>
        ))}
      </section>
      <div className={styles.detailGrid}>
        <Link href={`/minhas-cargas/${cargo.id}/mapa`} className={`${styles.detailTile} ${styles.detailTileAccent}`}>
          <span className={styles.tileLabel}>{t('tiles.map')}</span>
          <span className={styles.tileValue}>{t('tiles.mapValue')}</span>
        </Link>
        <Link href={`/minhas-cargas/${cargo.id}/documentos`} className={styles.detailTile}>
          <span className={styles.tileLabel}>{t('tiles.docs')}</span>
          <span className={styles.tileValue}>{cargo.pendingDocsCount}</span>
        </Link>
        <div className={styles.detailTile}>
          <span className={styles.tileLabel}>{t('tiles.window')}</span>
          <span className={styles.tileValue}>{t('tiles.windowValue')}</span>
        </div>
        <Link href={`/minhas-cargas/${cargo.id}/negociacao`} className={styles.detailTile}>
          <span className={styles.tileLabel}>{t('tiles.negotiation')}</span>
          <span className={styles.tileValue}>{t('tiles.offers', { count: cargo.offersCount })}</span>
        </Link>
      </div>
      <section className={styles.detailOpsSection} aria-label={t('opsSectionAria')}>
        <h2 className={styles.detailOpsTitle}>{t('opsSectionTitle')}</h2>
        <div className={styles.detailOpsGrid}>
          {operationCards.map((module) => (
            <article key={module.key} className={styles.detailOpsCard}>
              <p className={styles.detailOpsLabel}>{module.label}</p>
              <p className={styles.detailOpsValue}>{module.value}</p>
            </article>
          ))}
        </div>
      </section>
      <section className={styles.detailTimelineSection} aria-label={t('modules.timeline')}>
        <h2 className={styles.detailOpsTitle}>{t('modules.timeline')}</h2>
        <div className={styles.detailTimelineList}>
          <article className={styles.detailTimelineItem}>
            <p className={styles.detailTimelineLabel}>{t('modules.timeline')}</p>
            <p className={styles.detailTimelineValue}>{t('modules.timelineValue')}</p>
          </article>
          <article className={styles.detailTimelineItem}>
            <p className={styles.detailTimelineLabel}>{t('modules.compliance')}</p>
            <p className={styles.detailTimelineValue}>{t('modules.complianceValue')}</p>
          </article>
          <article className={styles.detailTimelineItem}>
            <p className={styles.detailTimelineLabel}>{t('modules.costs')}</p>
            <p className={styles.detailTimelineValue}>{t('modules.costsValue')}</p>
          </article>
        </div>
      </section>
    </>
  );
}
