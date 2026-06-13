'use client';

import { useLocale, useTranslations } from 'next-intl';
import type { OwnedCargoRiskItem, OwnedCargoRisksPreview } from '@/features/cargo/domain/derive-owned-cargo-detail';
import { BottomSheet } from '@/shared/components/bottom-sheet';
import { translateMock } from '@/shared/i18n/mock-content';
import {
  ownedCargoSheetDefaults,
  ownedCargoSheetPortalAttributes,
  ownedCargoSheetSnapHeights,
  useOwnedCargoSheetPortal,
} from '@/features/cargo/components/owned-cargo-sheet-defaults/owned-cargo-sheet-defaults';
import sheetStyles from '@/features/cargo/components/owned-cargo-sheets/owned-cargo-sheets.module.sass';

type OwnedCargoRisksSheetProps = {
  preview: OwnedCargoRisksPreview;
  risks: OwnedCargoRiskItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function OwnedCargoRisksSheet({
  preview,
  risks,
  open,
  onOpenChange,
}: OwnedCargoRisksSheetProps) {
  const t = useTranslations('pages.minhasCargas.detail.sheets.risks');
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
      {preview.state === 'clear' || risks.length === 0 ? (
        <p className={sheetStyles.emptyState} data-testid="owned-cargo-risks-sheet-clear">
          {t('clear')}
        </p>
      ) : (
        <ul className={sheetStyles.riskList} data-testid="owned-cargo-risks-sheet-list">
          {risks.map((risk) => (
            <li key={risk.id} className={sheetStyles.riskItem}>
              <div className={sheetStyles.riskHeader}>
                <p className={sheetStyles.riskLabel}>{translateMock(locale, risk.labelMock)}</p>
                <span className={sheetStyles.statusBadge} data-severity={risk.severity}>
                  {t(`severity.${risk.severity}`)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </BottomSheet>
  );
}
