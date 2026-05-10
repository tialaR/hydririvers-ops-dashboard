
import { getTranslations } from 'next-intl/server';
import { getOperationalDashboardSummary } from '@/features/marketplace/services/marketplace.service';
import { Card } from '@/shared/ui/card/card';
import { Link } from '@/core/i18n/navigation';
import { HydroIcon } from '@/shared/ui/hydro-icon/hydro-icon';
import { translateMock } from '@/shared/i18n/mock-content';
import { formatMockBrl } from '@/shared/i18n/mock-format';
import { intlAppPaths } from '@/shared/routing/app-routes';
import styles from './dashboard-overview.module.scss';

export async function DashboardOverview({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'pages.dashboardOverview' });
  const common = await getTranslations({ locale, namespace: 'common' });
  const summary = await getOperationalDashboardSummary();

  const stats = [
    { icon: 'cargo' as const, label: t('activeCargoes'), value: summary.activeCargoes, hint: t('activeMarketplace'), trend: t('metricTrendOpenCargoes'), tone: 'cargoTone' },
    { icon: 'info' as const, label: t('pendingDocuments'), value: summary.pendingDocuments, hint: t('documentsNeedAttention'), trend: t('metricTrendOpenCargoes'), tone: 'dealTone' },
    { icon: 'ship' as const, label: t('availableVessels'), value: summary.availableVessels, hint: t('riverRoutes'), trend: t('metricTrendVessels'), tone: 'shipTone' },
    { icon: 'document' as const, label: t('activeNegotiations'), value: summary.activeNegotiations, hint: t('quotesAndBookings'), trend: t('metricTrendNegotiations'), tone: 'dealTone' },
    { icon: 'leaf' as const, label: t('averageCo2Saving'), value: summary.averageSaving, hint: t('roadComparison'), trend: common('brDoMar'), tone: 'impactTone' }
  ] as const;

  return (
    <section className={styles.wrap} aria-label={t('sectionAriaLabel')}>
      <Card className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.heroEyebrow}>{t('heroEyebrow')}</span>
          <h2>{t('heroTitle')}</h2>
          <p>{t('heroDescription')}</p>
        </div>
        <div className={styles.heroActions}>
          <Link href={intlAppPaths.cargos.marketplace} className={styles.heroPrimaryAction}>
            <HydroIcon name="cargo" size={16} />
            {t('marketplaceCta')}
          </Link>
          <Link href={intlAppPaths.cargos.myCargos} className={styles.heroSecondaryAction}>
            {t('myCargoesCta')}
          </Link>
        </div>
      </Card>

      <div className={styles.grid}>
        {stats.map((item) => (
          <Card key={item.label} className={`${styles.metric} ${styles[item.tone]}`}>
            <span className={styles.icon}><HydroIcon name={item.icon} /></span>
            <div className={styles.metricBody}>
              <p>{item.label}</p>
              <strong>{item.value}</strong>
              <small>{item.hint}</small>
            </div>
            <em>{item.trend}</em>
          </Card>
        ))}
      </div>

      <div className={styles.panels}>
        <Card className={styles.panel}>
          <div className={styles.panelHeader}><h2>{t('attentionPanel')}</h2><span>{t('operation')}</span></div>
          {summary.attentionCargoes.map((cargo) => (
            <div className={styles.row} key={cargo.id}>
              <span className={styles.routeIcon}><HydroIcon name="route" size={18} /></span>
              <div>
                <strong>
                  {cargo.origin}
                  {common('routeArrow')}
                  {cargo.destination}
                </strong>
                <small>
                  {translateMock(locale, cargo.title)}
                  {common('inlineListSeparator')}
                  {t('readiness', { value: cargo.documentReadiness })}
                </small>
              </div>
              <b>{cargo.risk ?? t('watch')}</b>
            </div>
          ))}
        </Card>
        <Card className={styles.panel}>
          <div className={styles.panelHeader}><h2>{t('busiestCorridors')}</h2><span>{t('liveMock')}</span></div>
          {summary.busiestCorridors.map((corridor) => (
            <div className={styles.row} key={corridor.corridor}>
              <span className={styles.shipIcon}><HydroIcon name="waves" size={18} /></span>
              <div>
                <strong>{corridor.corridor}</strong>
                <small>{t('corridorSummary', { count: corridor.count })}</small>
              </div>
              <b>{t('movement')}</b>
            </div>
          ))}
        </Card>
      </div>

      <Card className={styles.tablePanel}>
        <div className={styles.panelHeader}><h2>{t('recentActivity')}</h2><span>{t('activeCount', { count: summary.recentNegotiations.length })}</span></div>
        <div className={styles.table}>
          {summary.recentNegotiations.map((negotiation) => (
            <div className={styles.tableRow} key={negotiation.id}>
              <strong>{negotiation.id}</strong>
              <span>{translateMock(locale, negotiation.cargoTitle)}</span>
              <span>{negotiation.route}</span>
              <span className={styles.stage}>{common(`dealStage.${negotiation.stage}`)}</span>
              <b>{formatMockBrl(locale, negotiation.amount)}</b>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}
