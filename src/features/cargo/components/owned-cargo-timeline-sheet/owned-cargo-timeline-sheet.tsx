'use client';

import { useLocale, useTranslations } from 'next-intl';
import type { OwnedCargoTimelineEvent, OwnedCargoTimelinePreview } from '@/features/cargo/domain/derive-owned-cargo-detail';
import { BottomSheet } from '@/shared/components/bottom-sheet';
import { translateMock } from '@/shared/i18n/mock-content';
import {
  ownedCargoSheetDefaults,
  ownedCargoSheetPortalAttributes,
  ownedCargoSheetSnapHeights,
  useOwnedCargoSheetPortal,
} from '@/features/cargo/components/owned-cargo-sheet-defaults/owned-cargo-sheet-defaults';
import sheetStyles from '@/features/cargo/components/owned-cargo-sheets/owned-cargo-sheets.module.sass';

type OwnedCargoTimelineSheetProps = {
  preview: OwnedCargoTimelinePreview;
  events: OwnedCargoTimelineEvent[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function OwnedCargoTimelineSheet({
  preview,
  events,
  open,
  onOpenChange,
}: OwnedCargoTimelineSheetProps) {
  const t = useTranslations('pages.minhasCargas.detail.sheets.timeline');
  const locale = useLocale();

  useOwnedCargoSheetPortal(open, sheetStyles.sheet, ownedCargoSheetPortalAttributes);

  const nextEvent = preview.nextEventMock ? translateMock(locale, preview.nextEventMock) : null;

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
      {preview.state === 'empty' || events.length === 0 ? (
        <p className={sheetStyles.emptyState} data-testid="owned-cargo-timeline-sheet-empty">
          {t('empty')}
        </p>
      ) : (
        <>
          {nextEvent ? (
            <>
              <h3 className={sheetStyles.sectionTitle}>{t('nextEventSection')}</h3>
              <p className={sheetStyles.metaValue}>{nextEvent}</p>
            </>
          ) : null}

          <h3 className={sheetStyles.sectionTitle}>{t('eventsSection')}</h3>
          <ul className={sheetStyles.timelineList} data-testid="owned-cargo-timeline-sheet-list">
            {events.map((event) => (
              <li key={event.id} className={sheetStyles.timelineItem} data-phase={event.phase}>
                <span className={sheetStyles.timelineDot} aria-hidden />
                <div>
                  <p className={sheetStyles.timelineLabel}>{translateMock(locale, event.labelMock)}</p>
                  <p className={sheetStyles.timelinePhase}>{t(`phase.${event.phase}`)}</p>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </BottomSheet>
  );
}
