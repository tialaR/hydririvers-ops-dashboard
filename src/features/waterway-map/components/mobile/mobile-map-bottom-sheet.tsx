'use client';

import { useTranslations } from 'next-intl';

import type { Cargo } from '@/features/marketplace/domain/marketplace.types';
import { BottomSheet } from '@/shared/components/bottom-sheet/BottomSheet';

import type { HydrowayMapModel } from '../../domain/hydroway-map-model.types';
import { MobileMapBottomSummary } from './mobile-map-bottom-summary';

type MobileMapBottomSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cargo: Cargo;
  model: HydrowayMapModel;
  progressPercent: number;
};

export function MobileMapBottomSheet({
  open,
  onOpenChange,
  cargo,
  model,
  progressPercent,
}: MobileMapBottomSheetProps) {
  const tMap = useTranslations('operationsBoard.map');

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={tMap('mapCargoSummary')}
      closeAriaLabel={tMap('mapClosePanel')}
      snap={40}
      enableSnapDrag
      closeOnOverlayClick
      variant="strong"
    >
      <MobileMapBottomSummary cargo={cargo} model={model} progressPercent={progressPercent} />
    </BottomSheet>
  );
}
