'use client';

import { useTranslations } from 'next-intl';

import { DsBadge } from '@/shared/design-system/components/badge';

import type { MobileSyncStatus } from '../../utils/mobile-route-view-model';
import styles from './mobile-offline-status-pill.module.scss';

export type MobileOfflineStatusPillProps = {
  status: MobileSyncStatus;
};

function resolveTone(status: MobileSyncStatus): 'success' | 'warning' | 'neutral' | 'info' {
  if (status === 'online') return 'success';
  if (status === 'syncing') return 'warning';
  if (status === 'pending') return 'info';
  return 'neutral';
}

function resolveLabelKey(status: MobileSyncStatus): string {
  if (status === 'online') return 'mobileSyncOnline';
  if (status === 'syncing') return 'mobileSyncSyncing';
  if (status === 'pending') return 'mobileSyncPending';
  return 'mobileSyncOffline';
}

export function MobileOfflineStatusPill({ status }: MobileOfflineStatusPillProps) {
  const tMap = useTranslations('operationsBoard.map');

  return (
    <DsBadge tone={resolveTone(status)} className={styles.pill} data-testid="hydroway-map-mobile-sync-pill">
      <span className={styles.dot} data-status={status} aria-hidden />
      {tMap(resolveLabelKey(status))}
    </DsBadge>
  );
}
