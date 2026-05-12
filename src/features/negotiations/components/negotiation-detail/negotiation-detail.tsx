import { getTranslations } from 'next-intl/server';
import { Link } from '@/core/i18n/navigation';
import { Card } from '@/shared/ui/card/card';
import { HydroIcon } from '@/shared/ui/hydro-icon/hydro-icon';
import type { Negotiation } from '@/features/marketplace/domain/marketplace.types';
import { translateMock } from '@/shared/i18n/mock-content';
import { formatMockBrl, formatMockDate } from '@/shared/i18n/mock-format';
import { getNegotiationDocumentStatus } from '@/features/negotiations/domain/negotiation-documents';
import { intlAppPaths } from '@/shared/routing/app-routes';
import styles from './negotiation-detail.module.scss';

type NegotiationDetailProps = {
  negotiation: Negotiation;
  locale: string;
};

export async function NegotiationDetail({ negotiation, locale }: NegotiationDetailProps) {
  const t = await getTranslations({ locale, namespace: 'pages.negotiationDetail' });
  const common = await getTranslations({ locale, namespace: 'common' });

  const stageLabel = common(`dealStage.${negotiation.stage}`);
  const stageMeaning = t(`stageMeaning.${negotiation.stage}`);

  return (
    <section className={styles.layout}>
      <div className={styles.left}>
        <Card className={styles.guide} data-testid="negotiation-decision-guide">
          <div className={styles.guideTop}>
            <h3 className={styles.guideTitle}>{t('whatNowTitle')}</h3>
            <span className={styles.guideStage}>{stageMeaning}</span>
          </div>
          <p className={styles.guideDescription}>{t('whatNowDescription', { stage: stageLabel })}</p>
          {negotiation.nextStep ? (
            <div className={styles.guideNext} data-testid="negotiation-detail-next-step">
              <HydroIcon name="check" size={16} />
              <span>{translateMock(locale, negotiation.nextStep)}</span>
            </div>
          ) : (
            <p className={styles.guideNextMuted}>{t('whatNowNoNextStep')}</p>
          )}
          <p className={styles.whyItMatters}>
            <HydroIcon name="info" size={16} /> {t('whyItMatters')}
          </p>
        </Card>

        <Card className={styles.summary} data-testid="negotiation-detail-summary">
          <div className={styles.summaryHead}>
            <span data-testid="negotiation-stage-label" className={styles.stagePill}>
              <HydroIcon name="document" /> {stageLabel}
            </span>
            <span className={styles.stageMeaningInline}>{stageMeaning}</span>
          </div>
          <h2 data-testid="negotiation-detail-title">{translateMock(locale, negotiation.cargoTitle)}</h2>
          <dl className={styles.routeMeta}>
            {negotiation.route ? (
              <div className={styles.metaPair}>
                <dt>{t('routeLabel')}</dt>
                <dd>{negotiation.route}</dd>
              </div>
            ) : null}
            <div className={styles.metaPair}>
              <dt>{t('operatorLabel')}</dt>
              <dd>{negotiation.vesselName}</dd>
            </div>
          </dl>
          {negotiation.cargoId ? (
            <p className={styles.cargoLinkWrap}>
              <Link className={styles.cargoLink} href={intlAppPaths.cargos.cargoDetail(negotiation.cargoId)} locale={locale}>
                {t('viewCargoLink')}
              </Link>
            </p>
          ) : null}
          <div className={styles.valueBlock}>
            <span className={styles.valueLabel}>{t('negotiatedValueLabel')}</span>
            <strong data-testid="negotiation-detail-value">{formatMockBrl(locale, negotiation.amount)}</strong>
            <p className={styles.valueHint}>{t('negotiatedValueHint')}</p>
          </div>
          {negotiation.nextStep ? (
            <div className={styles.nextStepInline}>
              <span className={styles.nextStepLabel}>
                <HydroIcon name="spark" size={16} /> {t('nextStepNow')}
              </span>
              <p className={styles.nextStepText}>{translateMock(locale, negotiation.nextStep)}</p>
            </div>
          ) : null}
        </Card>
      </div>

      <Card className={styles.panel}>
        <div className={styles.panelHeader}>
          <h3>{t('terms')}</h3>
          <p>{t('termsDescription')}</p>
        </div>
        <dl data-testid="negotiation-detail-terms">
          <div>
            <dt>{t('partiesTitle')}</dt>
            <dd>{negotiation.parties.join(t('partyListJoiner'))}</dd>
            <small>{t('partiesHint')}</small>
          </div>
          <div>
            <dt>{t('paymentTitle')}</dt>
            <dd>{negotiation.paymentTerms ? translateMock(locale, negotiation.paymentTerms) : '—'}</dd>
            <small>{t('paymentHint')}</small>
          </div>
          <div>
            <dt>{t('insuranceTitle')}</dt>
            <dd>{negotiation.insurance ? translateMock(locale, negotiation.insurance) : '—'}</dd>
            <small>{t('insuranceHint')}</small>
          </div>
          <div>
            <dt>{t('nextStepTitle')}</dt>
            <dd>{negotiation.nextStep ? translateMock(locale, negotiation.nextStep) : '—'}</dd>
            <small>{t('nextStepHint')}</small>
          </div>
        </dl>
      </Card>
      <Card className={styles.panel}>
        <div className={styles.panelHeader}>
          <h3>{t('documents')}</h3>
          <p>{t('documentsDescription')}</p>
        </div>
        <div className={styles.docList} data-testid="negotiation-detail-documents">
          {negotiation.documents?.map((item) => {
            const status = getNegotiationDocumentStatus(item);
            return (
              <div key={item} className={`${styles.docRow} ${styles[`doc_${status}`]}`} data-testid={`document-chip-${status}`}>
                <div className={styles.docRowTop}>
                  <span className={styles.docStatus}>{t(`documentStatus.${status}`)}</span>
                  <span className={styles.docName}>
                    <HydroIcon name="document" size={16} />
                    {translateMock(locale, item)}
                  </span>
                </div>
                <p className={styles.docImpact}>{t(`documentImpact.${status}`)}</p>
              </div>
            );
          })}
        </div>
      </Card>
      <Card className={styles.panel}>
        <div className={styles.panelHeader}>
          <h3>{t('history')}</h3>
          <p>{t('historyDescription')}</p>
        </div>
        <ol className={styles.steps} data-testid="negotiation-timeline">
          {negotiation.history?.map((event) => (
            <li key={event.title}>
              <span className={styles.dot}>
                <HydroIcon name="check" size={15} />
              </span>
              <div>
                <strong>{translateMock(locale, event.title)}</strong>
                <p>{translateMock(locale, event.description)}</p>
              </div>
              <time>{translateMock(locale, formatMockDate(locale, event.date))}</time>
            </li>
          ))}
        </ol>
      </Card>
    </section>
  );
}
