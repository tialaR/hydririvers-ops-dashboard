'use client';

import { useTranslations } from 'next-intl';

import { cargoDsV2ThemeRootClassName } from '@/features/cargo/constants/cargo-ds-v2-theme-scope';
import type { CargoLabV2 } from '@/features/cargo/types/cargo-lab-v2.types';
import { BottomSheet } from '@/shared/components/bottom-sheet';

import {
  publicCargoActionSheetPortalAttributes,
  publicCargoLightSheetDefaults,
  publicCargoLightSheetSnapHeights,
  usePublicCargoLightSheetPortal,
} from './public-cargo-light-sheet-defaults';
import { PublicCargoActionSheetContent } from './public-cargo-action-sheet-content';
import styles from './public-cargo-action-sheet.module.scss';

export type PublicCargoActionSheetProps = {
  cargo: CargoLabV2;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PublicCargoActionSheet({
  cargo,
  open,
  onOpenChange,
}: PublicCargoActionSheetProps) {
  const tBoard = useTranslations('operationsBoard');
  const sheetClassName = cargoDsV2ThemeRootClassName(styles.sheet);

  usePublicCargoLightSheetPortal(open, styles.sheet, publicCargoActionSheetPortalAttributes);

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={tBoard('publicActionSheet.title')}
      description={tBoard('publicActionSheet.description')}
      closeAriaLabel={tBoard('publicActionSheet.close')}
      dragHandleAriaLabel={tBoard('publicActionSheet.title')}
      snapHeights={publicCargoLightSheetSnapHeights}
      {...publicCargoLightSheetDefaults}
      className={sheetClassName}
      bodyClassName={styles.body}
    >
      <PublicCargoActionSheetContent
        cargo={cargo}
        onActionNavigate={() => onOpenChange(false)}
      />
    </BottomSheet>
  );
}
