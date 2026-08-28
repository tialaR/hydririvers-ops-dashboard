'use client';

import { type CSSProperties, type KeyboardEvent, type MouseEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { Link, useRouter } from '@/core/i18n/navigation';
import {
  ChevronIcon,
  ContainerIcon,
  CubeIcon,
} from '@/features/cargo/components/cargo-lab-v2/cargo-lab-v2-icons';
import { CargoEtaBlock } from '@/features/cargo/components/cargo-eta-block';
import { CargoRouteLine } from '@/features/cargo/components/cargo-route-line';
import { resolveOwnedCargoEtaDisplay } from '@/features/cargo/domain/resolve-owned-cargo-eta-display';
import { resolveOwnedCargoListMicro } from '@/features/cargo/domain/resolve-owned-cargo-list-micro';
import { mapCargoStatusToBadgeStatus } from '@/features/cargo/utils/cargo-status-semantic';
import { normalizeEtaValue } from '@/features/cargo/utils/normalize-eta-value';
import type { Cargo } from '@/features/marketplace/domain/marketplace.types';
import { StatusBadge } from '@/shared/components/status-badge';
import { translateMock } from '@/shared/i18n/mock-content';
import { intlAppPaths } from '@/shared/routing/app-routes';

import styles from './owned-cargo-card.module.sass';

function resolveMicroLabel(
  micro: ReturnType<typeof resolveOwnedCargoListMicro>,
  tCard: ReturnType<typeof useTranslations<'pages.minhasCargas.ownedCard'>>,
): string | null {
  if (micro.kind === 'none') return null;
  if (micro.messageMock) return micro.messageMock;
  if (micro.messageKey === 'proposals' && typeof micro.count === 'number') {
    return tCard('micro.proposals', { count: micro.count });
  }
  if (micro.messageKey) return tCard(`micro.${micro.messageKey}`);
  return null;
}

export function OwnedCargoCard({ cargo, index = 0 }: { cargo: Cargo; index?: number }) {
  const router = useRouter();
  const tCommon = useTranslations('common');
  const tCard = useTranslations('pages.minhasCargas.ownedCard');
  const locale = useLocale();
  const detailHref = intlAppPaths.cargos.myCargoDetail(cargo.id);

  const title = translateMock(locale, cargo.title);
  const etaValue = normalizeEtaValue(resolveOwnedCargoEtaDisplay(cargo)) || '—';
  const statusLabel = tCommon(`cargoStatus.${cargo.status}`);
  const badgeStatus = mapCargoStatusToBadgeStatus(cargo.status);
  const micro = resolveOwnedCargoListMicro(cargo);
  const microLabel = resolveMicroLabel(micro, tCard);
  const actionLabel = tCard('viewDetails');

  function handleOpen(event?: MouseEvent<HTMLElement>) {
    if (event?.target instanceof Element && event.target.closest('[data-owned-cargo-primary-action]')) {
      return;
    }

    router.push(detailHref);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.target !== event.currentTarget || (event.key !== 'Enter' && event.key !== ' ')) {
      return;
    }

    event.preventDefault();
    handleOpen();
  }

  return (
    <div
      className={styles.shell}
      data-testid="owned-cargo-card"
      data-owned-cargo-id={cargo.id}
      data-status={cargo.status}
      data-badge-status={badgeStatus}
    >
      <article
        className={styles.card}
        style={{ '--card-index': index } as CSSProperties}
        data-owned-cargo-card-surface="true"
        role="button"
        tabIndex={0}
        onClick={(event) => handleOpen(event)}
        onKeyDown={handleKeyDown}
      >
        <div className={styles.cardHeader}>
          <span className={styles.cargoIcon}>
            {cargo.cargoType === 'Projeto' ? <ContainerIcon /> : <CubeIcon />}
          </span>
          <span className={styles.cargoId}>{cargo.id}</span>
          <StatusBadge className={styles.statusBadge} status={badgeStatus} showDot size="sm">
            {statusLabel}
          </StatusBadge>
        </div>

        <h2 className={styles.title}>{title}</h2>

        {microLabel ? (
          <p className={styles.microRow} data-micro={micro.kind}>
            {microLabel}
          </p>
        ) : null}

        <CargoRouteLine originLabel={cargo.origin} destinationLabel={cargo.destination} />

        <div className={styles.footer}>
          <CargoEtaBlock className={styles.etaBlock} label="ETA" value={etaValue} />
          <Link
            href={detailHref}
            className={styles.cardAction}
            data-owned-cargo-primary-action="true"
            aria-label={actionLabel}
            onClick={(event) => event.stopPropagation()}
          >
            {actionLabel} <ChevronIcon />
          </Link>
        </div>
      </article>
    </div>
  );
}
