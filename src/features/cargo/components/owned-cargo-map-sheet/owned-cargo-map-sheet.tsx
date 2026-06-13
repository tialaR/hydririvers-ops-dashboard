'use client';

import { useTranslations } from 'next-intl';
import type { Cargo } from '@/features/marketplace/domain/marketplace.types';
import type { OwnedCargoMapPreview } from '@/features/cargo/domain/derive-owned-cargo-detail';
import { BottomSheet } from '@/shared/components/bottom-sheet';
import {
  ownedCargoSheetDefaults,
  ownedCargoSheetPortalAttributes,
  ownedCargoSheetSnapHeights,
  useOwnedCargoSheetPortal,
} from '@/features/cargo/components/owned-cargo-sheet-defaults/owned-cargo-sheet-defaults';
import sheetStyles from '@/features/cargo/components/owned-cargo-sheets/owned-cargo-sheets.module.sass';

type OwnedCargoMapSheetProps = {
  cargo: Cargo;
  map: OwnedCargoMapPreview;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function OwnedCargoMapSheet({ cargo, map, open, onOpenChange }: OwnedCargoMapSheetProps) {
  const t = useTranslations('pages.minhasCargas.detail.sheets.map');

  useOwnedCargoSheetPortal(open, sheetStyles.sheet, ownedCargoSheetPortalAttributes);

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t('title')}
      description={t('description')}
      closeAriaLabel={t('close')}
      dragHandleAriaLabel={t('dragHandle')}
      snapHeights={ownedCargoSheetSnapHeights}
      {...ownedCargoSheetDefaults}
      className={sheetStyles.sheet}
      bodyClassName={sheetStyles.body}
    >
      {map.state === 'unavailable' ? (
        <p className={sheetStyles.emptyState} data-testid="owned-cargo-map-sheet-empty">
          {t('unavailable')}
        </p>
      ) : (
        <>
          <h3 className={sheetStyles.sectionTitle}>{t('routeSection')}</h3>
          <ul className={sheetStyles.metaList}>
            <li className={sheetStyles.metaItem}>
              <span className={sheetStyles.metaLabel}>{t('originLabel')}</span>
              <span className={sheetStyles.metaValue}>{cargo.origin}</span>
            </li>
            <li className={sheetStyles.metaItem}>
              <span className={sheetStyles.metaLabel}>{t('destinationLabel')}</span>
              <span className={sheetStyles.metaValue}>{cargo.destination}</span>
            </li>
            <li className={sheetStyles.metaItem}>
              <span className={sheetStyles.metaLabel}>{t('routeStatusLabel')}</span>
              <span className={sheetStyles.metaValue}>{t('routeStatus', { progress: map.progressPercent })}</span>
            </li>
          </ul>

          <div className={sheetStyles.routePreview} data-testid="owned-cargo-map-sheet-preview">
            <div className={sheetStyles.routeLine} aria-hidden>
              <span className={sheetStyles.routeProgress} style={{ width: `${map.progressPercent}%` }} />
            </div>
            <div className={sheetStyles.routePoints}>
              <span className={sheetStyles.routePoint}>{cargo.origin}</span>
              <span className={sheetStyles.routePoint}>{cargo.destination}</span>
            </div>
            <p className={sheetStyles.routeCheckpoint}>
              {t('checkpointLabel', { checkpoint: map.checkpointLabel, route: map.routeLabel })}
            </p>
          </div>
        </>
      )}
    </BottomSheet>
  );
}
