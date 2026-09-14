'use client';

import { useTranslations } from 'next-intl';

import { Link } from '@/core/i18n/navigation';
import { intlAppPaths } from '@/shared/routing/app-routes';
import styles from '@/features/cargo/owned/screens/owned-cargo-desktop-foundation.module.sass';

type OwnedCargoDetailTabsProps = { cargoId: string };

export function OwnedCargoDetailTabs({ cargoId }: OwnedCargoDetailTabsProps) {
  const t = useTranslations('shipperMobileFlow');

  return <div className={styles.tabs}>
    <button type="button" aria-current="page">{t('myCargoes.desktop.tabs.overview')}</button>
    <Link href={`${intlAppPaths.cargos.myCargoDetail(cargoId)}?view=jornada`}>{t('myCargoes.desktop.route')}</Link>
    <Link href={intlAppPaths.cargos.myCargoDetail(cargoId)}>{t('myCargoes.desktop.cargo')}</Link>
    <Link href={`${intlAppPaths.cargos.myCargoDetail(cargoId)}/documentos`}>{t('myCargoes.desktop.tabs.documents')}</Link>
    <button type="button" disabled aria-disabled="true">{t('myCargoes.desktop.recommendedAction')}</button>
  </div>;
}
