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

  const criticalRisk = risks.find((risk) => risk.isCritical) ?? risks[0] ?? null;
  const secondaryRisks = risks.filter((risk) => risk.id !== criticalRisk?.id);

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
        <>
          {criticalRisk ? (
            <div
              className={sheetStyles.riskHero}
              data-critical={criticalRisk.isCritical ? 'true' : undefined}
              data-testid="owned-cargo-risks-sheet-critical"
            >
              <p className={sheetStyles.riskHeroLabel}>{t('primaryAlert')}</p>
              <p className={sheetStyles.riskLabel}>{translateMock(locale, criticalRisk.labelMock)}</p>
              <span className={sheetStyles.statusBadge} data-severity={criticalRisk.severity}>
                {t(`severity.${criticalRisk.severity}`)}
              </span>
              <p className={sheetStyles.riskImpact}>
                {t('impactLabel')}: {translateMock(locale, criticalRisk.impactMock)}
              </p>
              <p className={sheetStyles.riskRecommendation}>
                {t('recommendationLabel')}: {translateMock(locale, criticalRisk.recommendationMock)}
              </p>
            </div>
          ) : null}

          {secondaryRisks.length > 0 ? (
            <>
              <h3 className={sheetStyles.sectionTitle}>{t('otherAlertsSection')}</h3>
              <ul className={sheetStyles.riskList} data-testid="owned-cargo-risks-sheet-list">
                {secondaryRisks.map((risk) => (
                  <li key={risk.id} className={sheetStyles.riskItem}>
                    <div className={sheetStyles.riskHeader}>
                      <p className={sheetStyles.riskLabel}>{translateMock(locale, risk.labelMock)}</p>
                      <span className={sheetStyles.statusBadge} data-severity={risk.severity}>
                        {t(`severity.${risk.severity}`)}
                      </span>
                    </div>
                    <p className={sheetStyles.riskImpact}>
                      {t('impactLabel')}: {translateMock(locale, risk.impactMock)}
                    </p>
                    <p className={sheetStyles.riskRecommendation}>
                      {t('recommendationLabel')}: {translateMock(locale, risk.recommendationMock)}
                    </p>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </>
      )}
    </BottomSheet>
  );
}
