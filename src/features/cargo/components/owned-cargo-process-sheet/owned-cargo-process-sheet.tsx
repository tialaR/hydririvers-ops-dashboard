'use client';

import { useLocale, useTranslations } from 'next-intl';
import type {
  OwnedCargoDocumentItem,
  OwnedCargoProcessPreview,
  OwnedCargoProcessStep,
} from '@/features/cargo/domain/derive-owned-cargo-detail';
import { BottomSheet } from '@/shared/components/bottom-sheet';
import { translateMock } from '@/shared/i18n/mock-content';
import {
  ownedCargoSheetDefaults,
  ownedCargoSheetPortalAttributes,
  ownedCargoSheetSnapHeights,
  useOwnedCargoSheetPortal,
} from '@/features/cargo/components/owned-cargo-sheet-defaults/owned-cargo-sheet-defaults';
import sheetStyles from '@/features/cargo/components/owned-cargo-sheets/owned-cargo-sheets.module.sass';

type OwnedCargoProcessSheetProps = {
  preview: OwnedCargoProcessPreview;
  steps: OwnedCargoProcessStep[];
  documents: OwnedCargoDocumentItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function OwnedCargoProcessSheet({
  preview,
  steps,
  documents,
  open,
  onOpenChange,
}: OwnedCargoProcessSheetProps) {
  const t = useTranslations('pages.minhasCargas.detail.sheets.process');
  const locale = useLocale();

  useOwnedCargoSheetPortal(open, sheetStyles.sheet, ownedCargoSheetPortalAttributes);

  const fullStep = preview.fullStepMock ? translateMock(locale, preview.fullStepMock) : null;
  const pendingDocs = documents.filter((doc) => doc.needsAction);
  const actionDocument = pendingDocs[0]?.name ?? preview.actionLabelMock;

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
      {preview.state === 'empty' && !fullStep && steps.length === 0 ? (
        <p className={sheetStyles.emptyState} data-testid="owned-cargo-process-sheet-empty">
          {t('empty')}
        </p>
      ) : (
        <>
          {fullStep ? (
            <div className={sheetStyles.heroCard}>
              <p className={sheetStyles.riskHeroLabel}>{t('recommendedAction')}</p>
              <p className={sheetStyles.heroTitle}>{fullStep}</p>
            </div>
          ) : null}

          <h3 className={sheetStyles.sectionTitle}>{t('progressSection')}</h3>
          <div className={sheetStyles.routePreview}>
            <div
              className={sheetStyles.routeLine}
              role="progressbar"
              aria-valuenow={preview.progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={t('progressAria', { progress: preview.progressPercent })}
            >
              <span className={sheetStyles.routeProgress} style={{ width: `${preview.progressPercent}%` }} />
            </div>
            <p className={sheetStyles.routeCheckpoint}>{t('progressValue', { progress: preview.progressPercent })}</p>
          </div>

          <h3 className={sheetStyles.sectionTitle}>{t('checklistSection')}</h3>
          <ul className={sheetStyles.checklistList} data-testid="owned-cargo-process-sheet-checklist">
            {steps.map((step) => (
              <li key={step.id} className={sheetStyles.checklistItem} data-phase={step.phase}>
                <p className={sheetStyles.documentName}>{translateMock(locale, step.labelMock)}</p>
                <p className={sheetStyles.checklistPhase}>{t(`phase.${step.phase}`)}</p>
              </li>
            ))}
          </ul>

          {pendingDocs.length > 0 ? (
            <ul className={sheetStyles.documentList}>
              {pendingDocs.map((doc) => (
                <li key={doc.name} className={sheetStyles.documentItem}>
                  <div className={sheetStyles.documentHeader}>
                    <p className={sheetStyles.documentName}>{doc.name}</p>
                    <span className={sheetStyles.statusBadge} data-display={doc.displayStatus}>
                      {t('pendingBadge')}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}

          <button type="button" className={sheetStyles.actionButton} disabled aria-label={t('actionAria')}>
            {actionDocument ? t('actionCta', { item: actionDocument }) : t('actionFallback')}
          </button>
        </>
      )}
    </BottomSheet>
  );
}
