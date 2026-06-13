'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/core/i18n/navigation';
import type { Cargo } from '@/features/marketplace/domain/marketplace.types';
import { OwnedCargoCard } from '@/features/cargo/components/owned-cargo-card/owned-cargo-card';
import { OwnedCargoListSection } from '@/features/cargo/components/owned-cargo-list-section/owned-cargo-list-section';
import { OwnedCargoSummary } from '@/features/cargo/components/owned-cargo-summary/owned-cargo-summary';
import { summarizeOwnedCargoes } from '@/features/cargo/domain/summarize-owned-cargoes';
import { HydroIcon } from '@/shared/ui/hydro-icon/hydro-icon';
import { Card } from '@/shared/ui/card/card';
import { intlAppPaths } from '@/shared/routing/app-routes';
import listStyles from '@/features/cargo-market/components/cargo-list/cargo-list.module.scss';
import styles from './my-cargoes-list.module.scss';

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
  const stats = useMemo(() => summarizeOwnedCargoes(items), [items]);
  const shownIds = new Set(items.map((c) => c.id));

  return (
    <section className={styles.listRoot} aria-label={t('listSectionAriaLabel')}>
      <div className={styles.summaryRow}>
        <strong>{t('resultCount', { count: items.length })}</strong>
        <span>{t('showingCount', { visible: items.length, total: items.length })}</span>
      </div>

      {items.length > 0 ? <OwnedCargoSummary stats={stats} /> : null}

      {createdCargoId && shownIds.has(createdCargoId) ? (
        <Card className={styles.createdBanner} role="status" data-testid="minhas-cargas-created-banner">
          <HydroIcon name="cargo" size={22} />
          <p>{t('createdBanner')}</p>
        </Card>
      ) : null}
      {items.length ? (
        <OwnedCargoListSection>
          {items.map((cargo) => (
            <OwnedCargoCard key={cargo.id} cargo={cargo} />
          ))}
        </OwnedCargoListSection>
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
