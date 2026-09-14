'use client';

import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';

import { Link } from '@/core/i18n/navigation';
import { PAGE_61_219_254_VISUAL_FIXTURE_ID, page61219254SelectedVisualFacts } from '@/features/cargo/owned/fixtures/page-61-219-254.visual-fixture';
import { intlAppPaths } from '@/shared/routing/app-routes';
import styles from '@/features/cargo/owned/screens/owned-cargo-desktop-foundation.module.sass';

type OwnedCargoDetailTabsProps = { cargoId: string };

export function OwnedCargoDetailTabs({ cargoId }: OwnedCargoDetailTabsProps) {
  const t = useTranslations('shipperMobileFlow');
  const searchParams = useSearchParams();
  const fixtureEnabled = searchParams.get('visualFixture') === PAGE_61_219_254_VISUAL_FIXTURE_ID;
  const labels = fixtureEnabled ? page61219254SelectedVisualFacts.tabs : [
    t('myCargoes.desktop.tabs.overview'),
    t('myCargoes.desktop.route'),
    t('myCargoes.desktop.cargo'),
    t('myCargoes.desktop.tabs.documents'),
    t('myCargoes.desktop.recommendedAction')
  ];

  return <div className={styles.tabs}>
    <button type="button" aria-current="page">{labels[0]}</button>
    <Link href={`${intlAppPaths.cargos.myCargoDetail(cargoId)}?view=jornada`}>{labels[1]}</Link>
    <Link href={intlAppPaths.cargos.myCargoDetail(cargoId)}>{labels[2]}</Link>
    <Link href={`${intlAppPaths.cargos.myCargoDetail(cargoId)}/documentos`}>{labels[3]}</Link>
    <button type="button" disabled aria-disabled="true">{labels[4]}</button>
  </div>;
}
