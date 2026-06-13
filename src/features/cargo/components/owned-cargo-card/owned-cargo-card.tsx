'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/core/i18n/navigation';
import { intlAppPaths } from '@/shared/routing/app-routes';
import { HydroIcon } from '@/shared/ui/hydro-icon/hydro-icon';
import { resolveOwnedCargoProgress } from '@/features/cargo/domain/summarize-owned-cargoes';
import type { Cargo } from '@/features/marketplace/domain/marketplace.types';
import { translateMock } from '@/shared/i18n/mock-content';
import styles from './owned-cargo-card.module.sass';

function statusTone(status: Cargo['status']): 'success' | 'warning' | 'river' {
  if (status === 'reserved' || status === 'delivered') return 'success';
  if (status === 'contracting' || status === 'boarded') return 'warning';
  return 'river';
}

function resolvePrimaryAlert(cargo: Cargo, locale: string): string | null {
  if (cargo.operationalRisks?.length) {
    return translateMock(locale, cargo.operationalRisks[0]!);
  }

  const docPending = cargo.requiredDocuments?.some((document) => document.status === 'required') ?? false;
  if (docPending && cargo.documentsStatusSummary) {
    return translateMock(locale, cargo.documentsStatusSummary);
  }

  return null;
}

export function OwnedCargoCard({ cargo }: { cargo: Cargo }) {
  const tCommon = useTranslations('common');
  const tCard = useTranslations('pages.minhasCargas.ownedCard');
  const locale = useLocale();

  const progress = resolveOwnedCargoProgress(cargo);
  const alert = resolvePrimaryAlert(cargo, locale);
  const title = translateMock(locale, cargo.title);
  const nextStep = cargo.operationalNextStep ? translateMock(locale, cargo.operationalNextStep) : null;

  const ctaLabel = (() => {
    switch (cargo.myCargoesCta) {
      case 'complete':
        return tCard('ctaComplete');
      case 'proposals':
        return tCard('ctaProposals');
      case 'documents':
        return tCard('ctaDocuments');
      case 'track':
        return tCard('ctaTrack');
      default:
        return tCard('openOperation');
    }
  })();

  return (
    <Link
      href={intlAppPaths.cargos.myCargoDetail(cargo.id)}
      className={styles.link}
      data-testid="owned-cargo-card"
      data-owned-cargo-id={cargo.id}
      aria-label={tCard('openAria', { title, code: cargo.id })}
    >
      <article className={styles.card} data-status={cargo.status} data-status-tone={statusTone(cargo.status)}>
        <header className={styles.header}>
          <span className={styles.statusChip} data-tone={statusTone(cargo.status)}>
            {tCommon(`cargoStatus.${cargo.status}`)}
          </span>
          {alert ? (
            <span className={styles.alertChip} title={alert}>
              <HydroIcon name="shield" size={12} aria-hidden />
              <span className={styles.alertText}>{alert}</span>
            </span>
          ) : null}
        </header>

        <div className={styles.identityRow}>
          <span className={styles.code}>{cargo.id}</span>
          <h3 className={styles.title}>{title}</h3>
        </div>

        <p className={styles.route}>
          <span>{cargo.origin}</span>
          <HydroIcon name="ship" size={14} aria-hidden className={styles.routeIcon} />
          <span>{cargo.destination}</span>
        </p>

        <div className={styles.progressBlock}>
          <div className={styles.progressMeta}>
            <span>{tCard('progressLabel')}</span>
            <strong>{progress}%</strong>
          </div>
          <div
            className={styles.progressTrack}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            aria-label={tCard('progressAria', { value: progress })}
          >
            <span className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
        </div>

        {nextStep ? (
          <p className={styles.nextStep}>
            <span className={styles.nextStepLabel}>{tCard('nextStepLabel')}</span>
            <span className={styles.nextStepText}>{nextStep}</span>
          </p>
        ) : null}

        <footer className={styles.footer}>
          <span className={styles.cta}>{ctaLabel}</span>
          <HydroIcon name="chevronDown" size={16} aria-hidden className={styles.chevron} />
        </footer>
      </article>
    </Link>
  );
}
