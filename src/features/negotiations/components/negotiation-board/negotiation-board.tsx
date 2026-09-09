import { Banknote, ClipboardCheck, FileText, Handshake, RefreshCw } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/core/i18n/navigation';
import { intlAppPaths } from '@/shared/routing/app-routes';
import { Badge } from '@/shared/ui/badge/badge';
import { Card } from '@/shared/ui/card/card';
import { HydroIcon } from '@/shared/ui/hydro-icon/hydro-icon';
import type { DealStage, Negotiation } from '@/features/marketplace/domain/marketplace.types';
import { translateMock } from '@/shared/i18n/mock-content';
import { formatMockBrl, formatMockDate } from '@/shared/i18n/mock-format';
import { getNegotiationsSummary } from '@/features/negotiations/domain/negotiations-summary';
import styles from './negotiation-board.module.scss';

function progress(stage: DealStage) {
  const map: Record<DealStage, number> = {
    quote: 24,
    counteroffer: 42,
    contract: 62,
    boarding: 82,
    delivered: 100
  };
  return map[stage];
}

function iconForTitle(title: string) {
  const normalized = title.toLowerCase();
  if (normalized.includes('açaí') || normalized.includes('castanha') || normalized.includes('cacau')) return 'leaf';
  if (normalized.includes('pirarucu') || normalized.includes('medic')) return 'cargo';
  if (normalized.includes('solar')) return 'shield';
  return 'document';
}

type NegotiationBoardProps = {
  negotiations: Negotiation[];
  locale: string;
};

export async function NegotiationBoard({ negotiations, locale }: NegotiationBoardProps) {
  const p = await getTranslations({ locale, namespace: 'pages.negotiations' });
  const t = await getTranslations({ locale, namespace: 'common' });
  const summary = getNegotiationsSummary(negotiations);
  const counterofferNeedsAttention = summary.byStage.counteroffer > 0;

  return (
    <div className={styles.wrap}>
      <Card className={styles.guide} data-testid="negotiations-guide">
        <div className={styles.guideTop}>
          <h2 className={styles.guideTitle}>{p('guideTitle')}</h2>
          <span className={styles.guideBadgeWrap}>
            <Badge tone={summary.needsResponse > 0 ? 'warning' : 'river'}>
              {p('guideBadge', { count: summary.needsResponse })}
            </Badge>
          </span>
        </div>
        <p className={styles.guideDescription}>{p('guideDescription')}</p>
        <div
          className={styles.summaryGrid}
          data-testid="negotiations-summary"
          role="region"
          aria-label={p('summary.metricsRegionAria')}
        >
          <div className={styles.summaryMetric}>
            <div className={styles.summaryMetricHead}>
              <span className={styles.summaryMetricIconWrap} aria-hidden>
                <Handshake size={20} strokeWidth={2} />
              </span>
            </div>
            <span className={styles.summaryLabel}>{p('summary.active')}</span>
            <strong className={styles.summaryValue}>{summary.active}</strong>
            <p className={styles.summaryHint}>{p('summary.activeHint')}</p>
          </div>
          <div className={styles.summaryMetric}>
            <div className={styles.summaryMetricHead}>
              <span className={styles.summaryMetricIconWrap} aria-hidden>
                <FileText size={20} strokeWidth={2} />
              </span>
            </div>
            <span className={styles.summaryLabel}>{p('summary.quote')}</span>
            <strong className={styles.summaryValue}>{summary.byStage.quote}</strong>
            <p className={styles.summaryHint}>{p('summary.quoteHint')}</p>
          </div>
          <div
            className={`${styles.summaryMetric} ${counterofferNeedsAttention ? styles.summaryMetricAttention : ''}`}
          >
            <div className={styles.summaryMetricHead}>
              <span className={styles.summaryMetricIconWrap} aria-hidden>
                <RefreshCw size={20} strokeWidth={2} />
              </span>
              {counterofferNeedsAttention ? (
                <span className={styles.summaryRespondBadgeWrap}>
                  <Badge tone="warning">{p('summary.respondBadge')}</Badge>
                </span>
              ) : null}
            </div>
            <span className={styles.summaryLabel}>{p('summary.counteroffer')}</span>
            <strong className={styles.summaryValue}>{summary.byStage.counteroffer}</strong>
            <p className={styles.summaryHint}>{p('summary.counterofferHint')}</p>
          </div>
          <div className={styles.summaryMetric}>
            <div className={styles.summaryMetricHead}>
              <span className={styles.summaryMetricIconWrap} aria-hidden>
                <ClipboardCheck size={20} strokeWidth={2} />
              </span>
            </div>
            <span className={styles.summaryLabel}>{p('summary.contractsInProgress')}</span>
            <strong className={styles.summaryValue}>{summary.contractsInProgress}</strong>
            <p className={styles.summaryHint}>{p('summary.contractsHint')}</p>
          </div>
          <div className={`${styles.summaryMetric} ${styles.summaryMetricAmount}`}>
            <div className={styles.summaryMetricHead}>
              <span className={styles.summaryMetricIconWrap} aria-hidden>
                <Banknote size={20} strokeWidth={2} />
              </span>
            </div>
            <span className={styles.summaryLabel}>{p('summary.amountTotal')}</span>
            <strong className={styles.summaryValue}>{formatMockBrl(locale, summary.amountTotal)}</strong>
            <p className={styles.summaryHint}>{p('summary.amountHint')}</p>
          </div>
        </div>
      </Card>

      {negotiations.length === 0 ? (
        <Card className={styles.empty} data-testid="negotiations-empty">
          <h3 className={styles.emptyTitle}>{p('empty.title')}</h3>
          <p className={styles.emptyDescription}>{p('empty.description')}</p>
        </Card>
      ) : null}

      <section className={styles.board} aria-label={p('listSectionAriaLabel')} data-testid="negotiations-board">
        {negotiations.map((item) => (
          <Link
            key={item.id}
            locale={locale}
            href={intlAppPaths.negotiations.negotiationDetail(item.id)}
            className={styles.linkWrap}
            data-testid="negotiation-card"
            aria-label={t('openNegotiation', { title: translateMock(locale, item.cargoTitle) })}
          >
            <Card className={`${styles.card} ${styles[item.riskLevel ?? 'low']}`}>
              <div className={styles.top}>
                <span className={styles.icon}>
                  <HydroIcon name={iconForTitle(item.cargoTitle)} />
                </span>
                <div className={styles.stageWrap}>
                  <div className={styles.chipRow}>
                    {item.stage === 'counteroffer' ? (
                      <span className={styles.actionChipWrap}>
                        <Badge tone="warning">{p('actionRequiredBadge')}</Badge>
                      </span>
                    ) : null}
                    <Badge
                      tone={
                        item.stage === 'contract' || item.stage === 'boarding'
                          ? 'warning'
                          : item.stage === 'delivered'
                            ? 'success'
                            : 'river'
                      }
                    >
                      {t(`dealStage.${item.stage}`)}
                    </Badge>
                  </div>
                  <span className={styles.stageMeaning}>{p(`stageMeaning.${item.stage}`)}</span>
                </div>
              </div>
              <h2 data-testid="negotiation-card-title">{translateMock(locale, item.cargoTitle)}</h2>
              <dl className={styles.meta}>
                <div className={styles.metaRow}>
                  <dt>{p('card.operatorLabel')}</dt>
                  <dd>
                    <HydroIcon name="ship" size={15} /> {item.vesselName}
                  </dd>
                </div>
                {item.route ? (
                  <div className={`${styles.metaRow} ${styles.metaRowRoute}`}>
                    <dt>{p('card.routeLabel')}</dt>
                    <dd>
                      <HydroIcon name="route" size={15} /> {item.route}
                    </dd>
                  </div>
                ) : null}
                {item.parties?.length ? (
                  <div className={styles.metaRow}>
                    <dt>{p('card.partiesLabel')}</dt>
                    <dd>{item.parties.join(' · ')}</dd>
                  </div>
                ) : null}
                <div className={styles.metaRow}>
                  <dt>{p('card.valueLabel')}</dt>
                  <dd className={styles.valueAmount} data-testid="negotiation-card-value">
                    {formatMockBrl(locale, item.amount)}
                  </dd>
                </div>
              </dl>
              <div className={styles.timeline} aria-label={t('negotiationProgress', { progress: progress(item.stage) })}>
                <span style={{ width: `${progress(item.stage)}%` }} />
              </div>
              <div className={styles.nextBlock} data-testid="negotiation-card-next">
                <span className={styles.nextLabel}>{p('card.nextStepLabel')}</span>
                <p className={styles.nextText}>{item.nextStep ? translateMock(locale, item.nextStep) : '—'}</p>
                <p className={styles.updatedLine}>
                  <span className={styles.updatedPrefix}>{p('card.updatedLabel')}</span>
                  {t('inlineListSeparator')}
                  {translateMock(locale, formatMockDate(locale, item.lastUpdate))}
                </p>
              </div>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  );
}
