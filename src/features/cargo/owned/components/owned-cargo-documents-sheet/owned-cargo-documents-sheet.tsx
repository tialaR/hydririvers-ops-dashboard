'use client';

import { useTranslations } from 'next-intl';
import type { OwnedCargoDocumentItem, OwnedCargoDocumentsPreview } from '@/features/cargo/domain/derive-owned-cargo-detail';
import { BottomSheet } from '@/shared/components/bottom-sheet';
import {
  ownedCargoSheetDefaults,
  ownedCargoSheetPortalAttributes,
  ownedCargoSheetSnapHeights,
  useOwnedCargoSheetPortal,
} from '@/features/cargo/owned/components/owned-cargo-sheet-defaults/owned-cargo-sheet-defaults';
import sheetStyles from '@/features/cargo/owned/components/owned-cargo-sheets/owned-cargo-sheets.module.sass';

type OwnedCargoDocumentsSheetProps = {
  preview: OwnedCargoDocumentsPreview;
  documents: OwnedCargoDocumentItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function OwnedCargoDocumentsSheet({
  preview,
  documents,
  open,
  onOpenChange,
}: OwnedCargoDocumentsSheetProps) {
  const t = useTranslations('pages.minhasCargas.detail.sheets.documents');

  useOwnedCargoSheetPortal(open, sheetStyles.sheet, ownedCargoSheetPortalAttributes);

  const pendingDocuments = documents.filter((document) => document.needsAction);
  const topPending = pendingDocuments[0]?.name ?? preview.topPendingName;

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
      {preview.state === 'empty' || documents.length === 0 ? (
        <p className={sheetStyles.emptyState} data-testid="owned-cargo-documents-sheet-empty">
          {t('empty')}
        </p>
      ) : (
        <>
          <div className={sheetStyles.heroCard}>
            <p className={sheetStyles.summaryLabel}>
              {t('summary', {
                total: preview.totalCount,
                pending: preview.pendingCount,
                readiness: preview.readinessPercent,
              })}
            </p>
            <div className={sheetStyles.summaryBar}>
              <div
                className={sheetStyles.summaryTrack}
                role="progressbar"
                aria-valuenow={preview.readinessPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={t('readinessAria', { readiness: preview.readinessPercent })}
              >
                <span className={sheetStyles.summaryFill} style={{ width: `${preview.readinessPercent}%` }} />
              </div>
            </div>
          </div>

          {topPending ? (
            <div className={sheetStyles.documentBanner} data-testid="owned-cargo-documents-sheet-action-banner">
              <p className={sheetStyles.documentBannerTitle}>{t('actionBanner', { document: topPending })}</p>
              <p className={sheetStyles.actionHint}>{t('actionHint')}</p>
            </div>
          ) : null}

          <ul className={sheetStyles.documentList} data-testid="owned-cargo-documents-sheet-list">
            {documents.map((document) => (
              <li key={document.name} className={sheetStyles.documentItem}>
                <div className={sheetStyles.documentHeader}>
                  <p className={sheetStyles.documentName}>{document.name}</p>
                  <span
                    className={sheetStyles.statusBadge}
                    data-display={document.displayStatus}
                    data-status={document.status}
                  >
                    {t(`displayStatus.${document.displayStatus}`)}
                  </span>
                </div>
                {document.note ? <p className={sheetStyles.documentNote}>{document.note}</p> : null}
              </li>
            ))}
          </ul>

          <button type="button" className={sheetStyles.actionButton} disabled aria-label={t('actionAria')}>
            {topPending ? t('actionCta', { document: topPending }) : t('actionPlaceholder')}
          </button>
        </>
      )}
    </BottomSheet>
  );
}
