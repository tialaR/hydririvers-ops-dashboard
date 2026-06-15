'use client';

import { useTranslations } from 'next-intl';
import type { Cargo } from '@/features/marketplace/domain/marketplace.types';
import type { OwnedCargoMapPreview } from '@/features/cargo/domain/derive-owned-cargo-detail';
import { OwnedCargoRouteVisual } from '@/features/cargo/components/owned-cargo-route-visual/owned-cargo-route-visual';
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
          <div className={sheetStyles.heroCard} data-testid="owned-cargo-map-sheet-preview">
            <div className={sheetStyles.heroRow}>
              <p className={sheetStyles.heroTitle}>{map.routeLabel}</p>
              <span className={sheetStyles.statusChip}>{t(`status.${map.statusKey}`)}</span>
            </div>

            <OwnedCargoRouteVisual
              variant="hero"
              cargo={cargo}
              progressPercent={map.progressPercent}
              originLabel={cargo.origin}
              destinationLabel={cargo.destination}
            />

            <div className={sheetStyles.summaryBar}>
              <div
                className={sheetStyles.summaryTrack}
                role="progressbar"
                aria-valuenow={map.progressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={t('progressAria', { progress: map.progressPercent })}
              >
                <span className={sheetStyles.summaryFill} style={{ width: `${map.progressPercent}%` }} />
              </div>
              <p className={sheetStyles.summaryLabel}>
                {t('routeStatus', { progress: map.progressPercent })}
              </p>
            </div>
          </div>

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
              <span className={sheetStyles.metaLabel}>{t('checkpointCurrentLabel')}</span>
              <span className={sheetStyles.metaValue}>{map.checkpointLabel}</span>
            </li>
          </ul>

          <p className={sheetStyles.actionHint}>{t('statusHint', { checkpoint: map.checkpointLabel })}</p>
        </>
      )}
    </BottomSheet>
  );
}
