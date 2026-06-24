'use client';

import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/features/shipper-mobile-flow/components/language-switcher/language-switcher';
import { PrimaryButton } from '@/features/shipper-mobile-flow/components/primary-button/primary-button';
import { LineChartCard } from '@/features/shipper-mobile-flow/components/line-chart-card/line-chart-card';
import type { ShipperChartPoint } from '@/features/shipper-mobile-flow/types/shipper-flow-types';
import { useTheme } from '@/shared/providers/theme-provider';

import shellStyles from '../components/mobile-app-shell/mobile-app-shell.module.sass';
import styles from '../components/shared-ui/shared-ui.module.sass';

type LandingScreenProps = {
  chartPoints: ShipperChartPoint[];
};

export function LandingScreen({ chartPoints }: LandingScreenProps) {
  const t = useTranslations('shipperMobileFlow.landing');
  const { theme } = useTheme();

  return (
    <div className={shellStyles.root} data-theme={theme} data-shipper-shell>
    <div className={styles.landingHero}>
      <div className={styles.landingLogo} aria-hidden>
        HY
      </div>
      <h1 className={styles.landingTitle}>{t('title')}</h1>
      <p className={styles.landingSubtitle}>{t('subtitle')}</p>
      <LanguageSwitcher />
      <div className={styles.landingChart}>
        <LineChartCard
          title={t('publicRoutesTitle')}
          changeInsight={t('publicRoutesSummary')}
          actionHint={t('chartAction')}
          points={chartPoints}
          legendLabel={t('chartLegend')}
          unit={t('chartUnit')}
          riskLevel="low"
          freshnessMinutes={60}
          freshnessState="fresh"
          ariaLabel={t('chartAria')}
        />
      </div>
      <div className={styles.landingActions}>
        <PrimaryButton label={t('loginCta')} href="/entrar" />
        <PrimaryButton label={t('registerCta')} href="/registrar" variant="secondary" />
      </div>
    </div>
    </div>
  );
}
