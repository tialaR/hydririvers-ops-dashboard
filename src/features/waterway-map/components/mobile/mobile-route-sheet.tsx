'use client';

import { useTranslations } from 'next-intl';

import { BottomSheet } from '@/shared/components/bottom-sheet/BottomSheet';

import type { MobileRouteSheetViewModel } from '../../utils/mobile-route-view-model';
import { MobileRouteSheetContent } from './mobile-route-sheet-content';
import styles from './mobile-route-sheet.module.scss';

export type MobileRouteSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  viewModel: MobileRouteSheetViewModel;
};

export function MobileRouteSheet({ open, onOpenChange, viewModel }: MobileRouteSheetProps) {
  const tMap = useTranslations('operationsBoard.map');

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={tMap('mapCargoSummary')}
      closeAriaLabel={tMap('mapClosePanel')}
      snap={60}
      enableSnapDrag
      closeOnOverlayClick
      variant="strong"
      stackingZIndex={1100}
      className={styles.sheet}
      bodyClassName={styles.body}
    >
      <MobileRouteSheetContent viewModel={viewModel} />
    </BottomSheet>
  );
}
