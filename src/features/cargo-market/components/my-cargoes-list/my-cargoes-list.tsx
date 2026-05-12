'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/core/i18n/navigation';
import type { Cargo } from '@/features/marketplace/domain/marketplace.types';
import { CargoCard } from '@/features/cargo-market/components/cargo-card/cargo-card';
import { HydroIcon } from '@/shared/ui/hydro-icon/hydro-icon';
import { Card } from '@/shared/ui/card/card';
import { intlAppPaths } from '@/shared/routing/app-routes';
import listStyles from '@/features/cargo-market/components/cargo-list/cargo-list.module.scss';
import styles from './my-cargoes-list.module.scss';

function summarizeCargoes(items: Cargo[]) {
  let active = 0;
  let proposals = 0;
  let pending = 0;
  let inTransit = 0;

  for (const c of items) {
    if (c.status !== 'delivered') active += 1;
    proposals += typeof c.proposalsCount === 'number' ? c.proposalsCount : 0;
    const readiness = c.documentReadiness ?? 100;
    const docPending = c.requiredDocuments?.some((d) => d.status === 'required') ?? false;
    const incompleteRegistration = !c.publishedAt && c.status === 'open';
    if (readiness < 72 || incompleteRegistration || docPending) pending += 1;
    if (c.status === 'boarded') inTransit += 1;
  }

  return { active, proposals, pending, inTransit };
}

export function MyCargoesList({
  cargoes: initial,
  createdCargoId,
  canCreateCargo
}: {
  cargoes: Cargo[];
  createdCargoId?: string;
  canCreateCargo: boolean;
}) {
  const t = useTranslations('pages.minhasCargas');
  const items = initial;
  const stats = useMemo(() => summarizeCargoes(items), [items]);
  const shownIds = new Set(items.map((c) => c.id));

  return (
    <section aria-label={t('listSectionAriaLabel')}>
      <div className={styles.summaryRow}>
        <strong>{t('resultCount', { count: items.length })}</strong>
        <span>{t('showingCount', { visible: items.length, total: items.length })}</span>
      </div>

      {items.length > 0 ? (
        <div className={styles.operationSummary} data-testid="minhas-cargas-summary">
          <h2 className={styles.summarySectionTitle}>{t('summaryTitle')}</h2>
          <div className={styles.summaryGrid}>
            <Card className={styles.summaryCard}>
              <div className={styles.summaryIcon} aria-hidden>
                <HydroIcon name="cargo" size={20} />
              </div>
              <div className={styles.summaryCopy}>
                <span className={styles.summaryValue}>{stats.active}</span>
                <span className={styles.summaryLabel}>{t('summaryActiveLabel')}</span>
                <small className={styles.summaryHint}>{t('summaryActiveHint')}</small>
              </div>
            </Card>
            <Card className={styles.summaryCard}>
              <div className={styles.summaryIcon} aria-hidden>
                <HydroIcon name="message" size={20} />
              </div>
              <div className={styles.summaryCopy}>
                <span className={styles.summaryValue}>{stats.proposals}</span>
                <span className={styles.summaryLabel}>{t('summaryProposalsLabel')}</span>
                <small className={styles.summaryHint}>{t('summaryProposalsHint')}</small>
              </div>
            </Card>
            <Card className={styles.summaryCard}>
              <div className={styles.summaryIcon} aria-hidden>
                <HydroIcon name="document" size={20} />
              </div>
              <div className={styles.summaryCopy}>
                <span className={styles.summaryValue}>{stats.pending}</span>
                <span className={styles.summaryLabel}>{t('summaryPendingLabel')}</span>
                <small className={styles.summaryHint}>{t('summaryPendingHint')}</small>
              </div>
            </Card>
            <Card className={styles.summaryCard}>
              <div className={styles.summaryIcon} aria-hidden>
                <HydroIcon name="ship" size={20} />
              </div>
              <div className={styles.summaryCopy}>
                <span className={styles.summaryValue}>{stats.inTransit}</span>
                <span className={styles.summaryLabel}>{t('summaryTransitLabel')}</span>
                <small className={styles.summaryHint}>{t('summaryTransitHint')}</small>
              </div>
            </Card>
          </div>
        </div>
      ) : null}

      {createdCargoId && shownIds.has(createdCargoId) ? (
        <Card className={styles.createdBanner} role="status" data-testid="minhas-cargas-created-banner">
          <HydroIcon name="cargo" size={22} />
          <p>{t('createdBanner')}</p>
        </Card>
      ) : null}
      {items.length ? (
        <div className={listStyles.grid} data-testid="minhas-cargas-grid">
          {items.map((cargo) => (
            <CargoCard key={cargo.id} cargo={cargo} variant="myCargos" />
          ))}
        </div>
      ) : (
        <div className={listStyles.emptyState} data-testid="minhas-cargas-empty">
          <HydroIcon name="cargo" size={30} />
          <h2>{canCreateCargo ? t('emptyTitle') : t('emptyTitleCarrier')}</h2>
          <p>{canCreateCargo ? t('emptyDescription') : t('emptyDescriptionCarrier')}</p>
          <Link
            href={canCreateCargo ? intlAppPaths.cargos.publishCargo : intlAppPaths.cargos.marketplace}
            className={styles.emptyCta}
          >
            {canCreateCargo ? t('newCargoCta') : t('marketplaceCta')}
          </Link>
        </div>
      )}
    </section>
  );
}
