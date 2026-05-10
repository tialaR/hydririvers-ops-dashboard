'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/core/i18n/navigation';
import type { Cargo } from '@/features/marketplace/domain/marketplace.types';
import { CargoCard } from '@/features/cargo-market/components/cargo-card/cargo-card';
import { HydroIcon } from '@/shared/ui/hydro-icon/hydro-icon';
import { Card } from '@/shared/ui/card/card';
import { intlAppPaths } from '@/shared/routing/app-routes';
import listStyles from '@/features/cargo-market/components/cargo-list/cargo-list.module.scss';
import styles from './my-cargoes-list.module.scss';

export function MyCargoesList({
  cargoes: initial,
  createdCargoId
}: {
  cargoes: Cargo[];
  createdCargoId?: string;
}) {
  const t = useTranslations('pages.minhasCargas');
  const items = initial;

  const shownIds = new Set(items.map((c) => c.id));

  return (
    <section aria-label={t('listSectionAriaLabel')}>
      <div className={styles.summaryRow}>
        <strong>{t('resultCount', { count: items.length })}</strong>
        <span>{t('showingCount', { visible: items.length, total: items.length })}</span>
      </div>
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
          <h2>{t('emptyTitle')}</h2>
          <p>{t('emptyDescription')}</p>
          <Link href={intlAppPaths.cargos.publishCargo} className={styles.emptyCta}>{t('newCargoCta')}</Link>
        </div>
      )}
    </section>
  );
}
