'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';

import { BottomSheet } from '@/shared/components/bottom-sheet/BottomSheet';

import type { MobileRouteSheetViewModel } from '../../utils/mobile-route-view-model';
import { MobileRouteSheetContent } from './mobile-route-sheet-content';
import styles from './mobile-route-sheet.module.scss';

const ROUTE_SHEET_SNAP_ORDER = ['partial', 'expanded'] as const;

export type MobileRouteSheetSnap = (typeof ROUTE_SHEET_SNAP_ORDER)[number];

export type MobileRouteSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  viewModel: MobileRouteSheetViewModel;
  onSnapChange?: (snap: MobileRouteSheetSnap) => void;
};

export function MobileRouteSheet({ open, onOpenChange, viewModel, onSnapChange: onSnapChangeExternal }: MobileRouteSheetProps) {
  const tMap = useTranslations('operationsBoard.map');
  const [snap, setSnap] = useState<MobileRouteSheetSnap>('partial');

  const handleSnapChange = useCallback((snapId: string) => {
    if (snapId === 'partial' || snapId === 'expanded') {
      setSnap(snapId);
      onSnapChangeExternal?.(snapId);
    }
  }, [onSnapChangeExternal]);

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    if (!nextOpen) {
      setSnap('partial');
    }
    onOpenChange(nextOpen);
  }, [onOpenChange]);

  return (
    <BottomSheet
      open={open}
      onOpenChange={handleOpenChange}
      title={tMap('mobileRouteDetailsTitle')}
      closeAriaLabel={tMap('mobileRouteCollapseDetails')}
      dragHandleAriaLabel={snap === 'expanded' ? tMap('mobileRouteCollapseDetails') : tMap('mobileRouteExpandDetails')}
      snapHeights={{
        partial: '36dvh',
        expanded: '95dvh',
      }}
      snapOrder={[...ROUTE_SHEET_SNAP_ORDER]}
      initialSnap="partial"
      viewportAnchor="flush"
      enableDrag
      closeOnOverlayClick
      variant="strong"
      overlayVariant="map"
      stackingZIndex={1100}
      className={styles.sheet}
      bodyClassName={[styles.body, snap === 'expanded' ? styles.bodyExpanded : styles.bodyPartial].join(' ')}
      onSnapChange={handleSnapChange}
    >
      <MobileRouteSheetContent viewModel={viewModel} snap={snap} />
    </BottomSheet>
  );
}
