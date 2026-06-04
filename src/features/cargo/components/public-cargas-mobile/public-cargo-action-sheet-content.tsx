'use client';

import type { ReactNode } from 'react';
import {
  ArrowRight,
  FileText,
  Flag,
  Handshake,
  Map as MapIcon,
  Package,
  ReceiptText,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import { CargoLabV2StatusBadge } from '@/features/cargo/components/cargo-lab-v2/cargo-lab-v2-status-badge';
import { CargoEtaBlock } from '@/features/cargo/components/cargo-eta-block';
import { CargoRouteLine } from '@/features/cargo/components/cargo-route-line';
import type { CargoLabV2 } from '@/features/cargo/types/cargo-lab-v2.types';
import {
  getPublicCargoActionRoutes,
  type PublicCargoActionRoute,
  type PublicCargoActionRouteId,
} from '@/features/cargo/utils/get-public-cargo-action-routes';
import { Link } from '@/core/i18n/navigation';

import styles from './public-cargo-action-sheet.module.scss';

const ACTION_ICONS: Record<PublicCargoActionRouteId, ReactNode> = {
  detail: <Package aria-hidden />,
  route: <MapIcon aria-hidden />,
  documents: <FileText aria-hidden />,
  costs: <ReceiptText aria-hidden />,
  priority: <Flag aria-hidden />,
  negotiations: <Handshake aria-hidden />,
};

export type PublicCargoActionSheetContentProps = {
  cargo: CargoLabV2;
  onActionNavigate?: () => void;
};

export function PublicCargoActionSheetContent({
  cargo,
  onActionNavigate,
}: PublicCargoActionSheetContentProps) {
  const tBoard = useTranslations('operationsBoard');

  const actions = getPublicCargoActionRoutes(cargo.id, {
    detail: {
      label: tBoard('publicActionSheet.detailTitle'),
      description: tBoard('publicActionSheet.detailDescription'),
    },
    route: {
      label: tBoard('publicActionSheet.routeTitle'),
      description: tBoard('publicActionSheet.routeDescription'),
    },
    documents: {
      label: tBoard('publicActionSheet.documentsTitle'),
      description: tBoard('publicActionSheet.documentsDescription'),
    },
    costs: {
      label: tBoard('publicActionSheet.costsTitle'),
      description: tBoard('publicActionSheet.costsDescription'),
    },
    priority: {
      label: tBoard('publicActionSheet.priorityTitle'),
      description: tBoard('publicActionSheet.priorityDescription'),
    },
    negotiations: {
      label: tBoard('publicActionSheet.negotiationsTitle'),
      description: tBoard('publicActionSheet.negotiationsDescription'),
    },
  });

  return (
    <>
      <div className={styles.summary}>
        <div className={styles.summaryHeader}>
          <span className={styles.cargoCode}>{cargo.id}</span>
          <CargoLabV2StatusBadge cargo={cargo} showDot={false} size="sm" variant="sheet" />
        </div>

        <h2 className={styles.summaryTitle}>{cargo.title}</h2>

        <CargoRouteLine
          variant="sheet"
          originLabel={cargo.origin}
          destinationLabel={cargo.destination}
          originMeta={cargo.originTerminal}
          destinationMeta={cargo.destinationTerminal}
        />

        {cargo.eta ? (
          <CargoEtaBlock variant="sheet" metrics={[{ label: 'ETA', value: cargo.eta }]} />
        ) : null}
      </div>

      <nav className={styles.actionList} aria-label={tBoard('publicActionSheet.navigationAria')}>
        {actions.map((action: PublicCargoActionRoute) => (
          <Link
            key={action.id}
            href={action.href}
            className={styles.actionItem}
            data-public-cargo-action="true"
            aria-label={`${action.label}: ${action.description}`}
            onClick={() => onActionNavigate?.()}
          >
            <span className={styles.actionIcon} aria-hidden>
              {ACTION_ICONS[action.id]}
            </span>
            <span className={styles.actionCopy}>
              <strong>{action.label}</strong>
              <small>{action.description}</small>
            </span>
            <ArrowRight className={styles.actionArrow} aria-hidden />
          </Link>
        ))}
      </nav>
    </>
  );
}
