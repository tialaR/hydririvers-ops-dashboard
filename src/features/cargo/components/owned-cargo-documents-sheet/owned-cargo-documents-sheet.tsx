'use client';

import { useTranslations } from 'next-intl';
import type { OwnedCargoDocumentItem, OwnedCargoDocumentsPreview } from '@/features/cargo/domain/derive-owned-cargo-detail';
import { BottomSheet } from '@/shared/components/bottom-sheet';
import {
  ownedCargoSheetDefaults,
  ownedCargoSheetPortalAttributes,
  ownedCargoSheetSnapHeights,
  useOwnedCargoSheetPortal,
} from '@/features/cargo/components/owned-cargo-sheet-defaults/owned-cargo-sheet-defaults';
import sheetStyles from '@/features/cargo/components/owned-cargo-sheets/owned-cargo-sheets.module.sass';

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
          <p className={sheetStyles.metaValue}>
            {t('summary', {
              total: preview.totalCount,
              pending: preview.pendingCount,
              readiness: preview.readinessPercent,
            })}
          </p>
          <ul className={sheetStyles.documentList} data-testid="owned-cargo-documents-sheet-list">
            {documents.map((document) => (
              <li key={document.name} className={sheetStyles.documentItem}>
                <div className={sheetStyles.documentHeader}>
                  <p className={sheetStyles.documentName}>{document.name}</p>
                  <span className={sheetStyles.statusBadge} data-status={document.status}>
                    {t(`status.${document.status}`)}
                  </span>
                </div>
                {document.note ? <p className={sheetStyles.documentNote}>{document.note}</p> : null}
              </li>
            ))}
          </ul>
          <button type="button" className={sheetStyles.statusBadge} disabled aria-label={t('actionAria')}>
            {t('actionPlaceholder')}
          </button>
        </>
      )}
    </BottomSheet>
  );
}
