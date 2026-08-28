'use client';

import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/features/product-shell/components/language-switcher/language-switcher';
import { PrimaryButton } from '@/features/product-shell/components/primary-button/primary-button';
import {
  OperationalChartCard,
  OperationalLineChart,
  type OperationalChartPoint
} from '@/shared/design-system/patterns/operational-chart';
import { useTheme } from '@/shared/providers/theme-provider';
import shellStyles from '@/features/product-shell/components/mobile-app-shell/mobile-app-shell.module.sass';
import styles from './shipper-landing-screen.module.sass';

type ShipperLandingScreenProps = { chartPoints: OperationalChartPoint[] };

export function ShipperLandingScreen({ chartPoints }: ShipperLandingScreenProps) {
  const t = useTranslations('shipperMobileFlow.landing');
  const chartT = useTranslations('shipperMobileFlow.chart');
  const riskT = useTranslations('shipperMobileFlow.risk');
  const freshnessT = useTranslations('shipperMobileFlow.freshness');
  const { theme } = useTheme();
  const chartAria = t('chartAria');

  return (
    <div className={shellStyles.root} data-theme={theme} data-shipper-shell>
      <div className={styles.landingHero}>
        <div className={styles.landingLogo} aria-hidden>HY</div>
        <h1 className={styles.landingTitle}>{t('title')}</h1>
        <p className={styles.landingSubtitle}>{t('subtitle')}</p>
        <LanguageSwitcher />
        <div className={styles.landingChart}>
          <OperationalChartCard
            title={t('publicRoutesTitle')}
            changeInsight={t('publicRoutesSummary')}
            actionHint={t('chartAction')}
            points={chartPoints}
            legendLabel={t('chartLegend')}
            unit={t('chartUnit')}
            riskLevel="low"
            freshnessMinutes={60}
            freshnessState="fresh"
            ariaLabel={chartAria}
            copy={{
              staleBanner: chartT('staleBanner'),
              empty: chartT('empty'),
              actionLabel: chartT('actionLabel'),
              tablePeriod: chartT('tablePeriod'),
              tableValue: chartT('tableValue'),
              riskLabel: riskT('low'),
              freshnessLabel: freshnessT('fresh', { minutes: 60 })
            }}
          >
            <OperationalLineChart points={chartPoints} unit={t('chartUnit')} ariaLabel={chartAria} />
          </OperationalChartCard>
        </div>
        <div className={styles.landingActions}>
          <PrimaryButton label={t('loginCta')} href="/entrar" />
          <PrimaryButton label={t('registerCta')} href="/registrar" variant="secondary" />
        </div>
      </div>
    </div>
  );
}
