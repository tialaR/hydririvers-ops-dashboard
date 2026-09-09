'use client';

import { useLocale, useTranslations } from 'next-intl';
import type { OwnedCargoTrackingDetail } from '@/features/cargo/domain/derive-owned-cargo-detail';
import { OwnedCargoRouteVisual } from '@/features/cargo/owned/components/owned-cargo-route-visual/owned-cargo-route-visual';
import { BottomSheet } from '@/shared/components/bottom-sheet';
import { translateMock } from '@/shared/i18n/mock-content';
import {
  ownedCargoSheetDefaults,
  ownedCargoSheetPortalAttributes,
  ownedCargoSheetSnapHeights,
  useOwnedCargoSheetPortal,
} from '@/features/cargo/owned/components/owned-cargo-sheet-defaults/owned-cargo-sheet-defaults';
import sheetStyles from '@/features/cargo/owned/components/owned-cargo-sheets/owned-cargo-sheets.module.sass';

type OwnedCargoTrackingSheetProps = {
  detail: OwnedCargoTrackingDetail | null;
  originLabel: string;
  destinationLabel: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function OwnedCargoTrackingSheet({
  detail,
  originLabel,
  destinationLabel,
  open,
  onOpenChange,
}: OwnedCargoTrackingSheetProps) {
  const t = useTranslations('pages.minhasCargas.detail.sheets.tracking');
  const locale = useLocale();

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
      {!detail ? (
        <p className={sheetStyles.emptyState} data-testid="owned-cargo-tracking-sheet-empty">
          {t('unavailable')}
        </p>
      ) : (
        <>
          <div className={sheetStyles.heroCard}>
            <div className={sheetStyles.heroRow}>
              <span className={sheetStyles.statusChip} data-tone={detail.isLive ? 'live' : undefined}>
                {detail.isLive ? <span className={sheetStyles.liveDot} aria-hidden /> : null}
                {detail.isLive ? t('liveStatus') : t('statusStandby')}
              </span>
              {detail.etaLabel ? (
                <span className={sheetStyles.statusChip} data-tone="success">
                  {t('etaLabel', { eta: detail.etaLabel })}
                </span>
              ) : null}
            </div>

            <OwnedCargoRouteVisual
              progressPercent={detail.progressPercent}
              originLabel={originLabel}
              destinationLabel={destinationLabel}
              testId="owned-cargo-tracking-sheet-route"
            />
          </div>

          <h3 className={sheetStyles.sectionTitle}>{t('channelSection')}</h3>
          <ul className={sheetStyles.metaList}>
            <li className={sheetStyles.metaItem}>
              <span className={sheetStyles.metaLabel}>{t('channelLabel')}</span>
              <span className={sheetStyles.metaValue}>{detail.channelLabel}</span>
            </li>
            <li className={sheetStyles.metaItem}>
              <span className={sheetStyles.metaLabel}>{t('progressLabel')}</span>
              <span className={sheetStyles.metaValue}>{t('progressValue', { progress: detail.progressPercent })}</span>
            </li>
          </ul>

          <h3 className={sheetStyles.sectionTitle}>{t('operationSection')}</h3>
          <ul className={sheetStyles.metaList} data-testid="owned-cargo-tracking-sheet-details">
            <li className={sheetStyles.metaItem}>
              <span className={sheetStyles.metaLabel}>{t('vesselLabel')}</span>
              <span className={sheetStyles.metaValue}>{translateMock(locale, detail.vesselLabelMock)}</span>
            </li>
            <li className={sheetStyles.metaItem}>
              <span className={sheetStyles.metaLabel}>{t('convoyLabel')}</span>
              <span className={sheetStyles.metaValue}>{translateMock(locale, detail.convoyLabelMock)}</span>
            </li>
            <li className={sheetStyles.metaItem}>
              <span className={sheetStyles.metaLabel}>{t('operatorLabel')}</span>
              <span className={sheetStyles.metaValue}>{translateMock(locale, detail.operatorLabelMock)}</span>
            </li>
            <li className={sheetStyles.metaItem}>
              <span className={sheetStyles.metaLabel}>{t('checkpointLabel')}</span>
              <span className={sheetStyles.metaValue}>{detail.checkpointLabel}</span>
            </li>
            <li className={sheetStyles.metaItem}>
              <span className={sheetStyles.metaLabel}>{t('nextStopLabel')}</span>
              <span className={sheetStyles.metaValue}>{detail.nextStopLabel}</span>
            </li>
          </ul>
        </>
      )}
    </BottomSheet>
  );
}
