'use client';

import { useTranslations } from 'next-intl';

import { Link } from '@/core/i18n/navigation';
import { intlAppPaths } from '@/shared/routing/app-routes';
import styles from '@/features/cargo/owned/screens/owned-cargo-desktop-foundation.module.sass';

export type OwnedCargoDetailTabsProps = {
  cargoId: string;
  labels?: readonly [string, string, string, string, string];
};

export function OwnedCargoDetailTabs({ cargoId, labels: labelsOverride }: OwnedCargoDetailTabsProps) {
  const t = useTranslations('shipperMobileFlow');
  const labels = labelsOverride ?? [
    t('myCargoes.desktop.tabs.overview'),
    t('myCargoes.desktop.route'),
    t('myCargoes.desktop.cargo'),
    t('myCargoes.desktop.tabs.documents'),
    t('myCargoes.desktop.recommendedAction')
  ];

  return <div className={styles.tabs} data-testid="page61-detail-tabs">
    <button type="button" aria-current="page">{labels[0]}</button>
    <Link href={`${intlAppPaths.cargos.myCargoDetail(cargoId)}?view=jornada`}>{labels[1]}</Link>
    <Link href={intlAppPaths.cargos.myCargoDetail(cargoId)}>{labels[2]}</Link>
    <Link href={`${intlAppPaths.cargos.myCargoDetail(cargoId)}/documentos`}>{labels[3]}</Link>
    <button type="button" disabled aria-disabled="true">{labels[4]}</button>
  </div>;
}
