import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  Anchor,
  CheckCircle2,
  CircleAlert,
  ClipboardCheck,
  Clock3,
  FileWarning,
  Gauge,
  Loader,
  Radar,
  ShieldAlert,
  Snowflake,
  Target,
  TrendingDown
} from 'lucide-react';
import type { Cargo } from '@/features/marketplace/domain/marketplace.types';
import { Badge } from '@/shared/ui/badge/badge';
import { Button } from '@/shared/ui/button/button';
import { getCargoPriority } from '@/features/cargo/utils/cargo-priority';
import type { CargoPriorityChecklistItem, CargoPrioritySummaryItem } from '@/features/cargo/types/cargo-priority.types';
import styles from './priority-tab.module.scss';

const summaryIconById: Record<string, typeof ShieldAlert> = {
  risk: ShieldAlert,
  window: Anchor,
  tracking: Radar,
  documents: FileWarning
};

function renderHeroIcon(id: string) {
  const size = 44;
  const stroke = 2;
  switch (id) {
    case 'confirm-dock-window':
      return <Anchor size={size} strokeWidth={stroke} />;
    case 'validate-documents':
      return <ClipboardCheck size={size} strokeWidth={stroke} />;
    case 'confirm-operator':
      return <CheckCircle2 size={size} strokeWidth={stroke} />;
    case 'monitor-signal':
      return <Radar size={size} strokeWidth={stroke} />;
    case 'update-delay':
      return <Clock3 size={size} strokeWidth={stroke} />;
    default:
      return <ShieldAlert size={size} strokeWidth={stroke} />;
  }
}

function checklistTone(status: CargoPriorityChecklistItem['status']) {
  if (status === 'done') return 'done';
  if (status === 'inProgress') return 'progress';
  return 'pending';
}

function summaryValueLeaf(valueKey: string) {
  const parts = valueKey.split('.');
  return parts[parts.length - 1] ?? '';
}

function summaryDetailKey(item: CargoPrioritySummaryItem) {
  const base = item.titleKey.replace(/\.title$/, '');
  const leaf = summaryValueLeaf(item.valueKey);
  return `${base}.detail.${leaf}`;
}

function checklistWhyKey(labelKey: string) {
  return labelKey.replace('.checklist.', '.checklistWhy.');
}

function signalToneClass(id: string) {
  if (id === 'risk') return styles.signalValue_attention;
  if (id === 'window') return styles.signalValue_logistics;
  if (id === 'tracking') return styles.signalValue_track;
  return styles.signalValue_docs;
}

function summaryCardClass(id: string) {
  if (id === 'risk') return styles.summaryCard_risk;
  if (id === 'window') return styles.summaryCard_window;
  if (id === 'tracking') return styles.summaryCard_tracking;
  return '';
}

export function PriorityTab({ cargo }: { cargo: Cargo }) {
  const t = useTranslations('operationsBoard');
  const priority = cargo.priority ?? getCargoPriority(cargo);
  const hasActions = priority.actions.length > 0;

  const summaryCards = useMemo(() => priority.summary.slice(0, 3), [priority.summary]);

  const primaryCheck = useMemo(() => {
    return (
      priority.checklist.find((item) => item.status === 'pending')
      ?? priority.checklist.find((item) => item.status === 'inProgress')
      ?? priority.checklist[0]
    );
  }, [priority.checklist]);

  const secondaryChecks = useMemo(
    () => priority.checklist.filter((item) => item.id !== primaryCheck.id).slice(0, 4),
    [priority.checklist, primaryCheck.id]
  );

  const primaryTone = checklistTone(primaryCheck.status);

  return (
    <div className={styles.panel}>
      <section className={styles.hero} aria-labelledby="priority-heading">
        <div className={styles.heroGrid}>
          <div className={styles.heroLead}>
            <h2 className={styles.title} id="priority-heading">
              {t('priority.title')}
            </h2>
            <p className={styles.tagline}>{t('priority.subtitle')}</p>
          </div>

          <div className={styles.callout} role="status">
            <span className={styles.calloutPrefix}>{t('priority.nowPrefix')}</span>
            <p className={styles.calloutTitle} id="priority-main-callout">
              {t(primaryCheck.labelKey)}
            </p>
          </div>

          <div className={styles.heroScore}>
            <div className={styles.scorePanelTop}>
              <div className={styles.heroFigure} aria-hidden="true">
                {renderHeroIcon(primaryCheck.id)}
              </div>
              <div className={styles.scorePanelBody}>
                <div className={styles.scoreRow}>
                  <div className={styles.scoreBig}>
                    <span className={styles.scoreNumber}>{priority.score}</span>
                    <span className={styles.scoreSlash}>/</span>
                    <span className={styles.scoreMax}>100</span>
                  </div>
                  <Badge tone={priority.level === 'high' ? 'warning' : priority.level === 'medium' ? 'river' : 'success'}>
                    {t(priority.badgeLabelKey)}
                  </Badge>
                </div>
                <span className={styles.scoreMicro}>{t('priority.scoreLabel')}</span>
                <div className={styles.scoreMeter} aria-hidden="true">
                  <i style={{ width: `${priority.score}%` }} />
                </div>
                <p className={styles.scoreHint}>{t('priority.scoreHint')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {!hasActions ? (
        <div className={styles.emptyState}>
          <h3>{t(priority.emptyTitleKey)}</h3>
          <p>{t(priority.emptyDescriptionKey)}</p>
          <Button variant="secondary">{t(priority.emptyCtaLabelKey)}</Button>
        </div>
      ) : (
        <>
          <section className={styles.signalsRegion} aria-labelledby="priority-signals-heading">
            <h3 className={styles.regionTitle} id="priority-signals-heading">
              {t('priority.signalsTitle')}
            </h3>
            <div className={styles.summaryGrid}>
              {summaryCards.map((item) => {
                const Icon = summaryIconById[item.id] ?? Gauge;
                const detailKey = summaryDetailKey(item);
                const cardExtra = summaryCardClass(item.id);
                return (
                  <article className={`${styles.summaryCard} ${cardExtra}`.trim()} key={item.id}>
                    <span className={styles.iconWell} aria-hidden="true">
                      <Icon size={30} strokeWidth={2} />
                    </span>
                    <strong className={styles.summaryCardTitle}>{t(item.titleKey)}</strong>
                    <span className={`${styles.signalValue} ${signalToneClass(item.id)}`}>{t(item.valueKey)}</span>
                    <p className={styles.summaryDescription}>{t(detailKey)}</p>
                  </article>
                );
              })}
            </div>
          </section>

          <div className={styles.lowerGrid}>
            <section className={styles.recommendedBlock} aria-label={t('priority.actionsAria')}>
              <h3 className={styles.regionTitle}>{t('priority.checklistTitle')}</h3>

              <article className={styles.primaryMission} aria-describedby="priority-main-callout">
                <span className={styles.missionIcon} aria-hidden="true">
                  <Target size={32} strokeWidth={2} />
                </span>
                <div className={styles.missionBody}>
                  <div className={styles.missionHead}>
                    <h4 className={styles.missionTitle}>{t(primaryCheck.labelKey)}</h4>
                    <Badge
                      tone={
                        primaryTone === 'done' ? 'success' : primaryTone === 'progress' ? 'river' : 'warning'
                      }
                    >
                      {t(`priority.checklistStatus.${primaryTone}`)}
                    </Badge>
                  </div>
                  <p className={styles.missionWhy}>{t(checklistWhyKey(primaryCheck.labelKey))}</p>
                </div>
              </article>

              <div className={styles.secondaryBlock}>
                <p className={styles.secondaryHeading}>{t('priority.secondaryActionsTitle')}</p>
                <ul className={styles.secondaryList}>
                  {secondaryChecks.map((item) => {
                    const status = checklistTone(item.status);
                    const StatusIcon = status === 'done' ? CheckCircle2 : status === 'progress' ? Loader : CircleAlert;
                    return (
                      <li className={styles.secondaryItem} key={item.id}>
                        <span className={styles.secondaryIcon} aria-hidden="true">
                          <StatusIcon size={17} strokeWidth={2} />
                        </span>
                        <div className={styles.secondaryCopy}>
                          <div className={styles.secondaryTop}>
                            <strong>{t(item.labelKey)}</strong>
                            <Badge tone={status === 'done' ? 'success' : status === 'progress' ? 'river' : 'neutral'}>
                              {t(`priority.checklistStatus.${status}`)}
                            </Badge>
                          </div>
                          <span className={styles.secondaryWhy}>{t(checklistWhyKey(item.labelKey))}</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </section>

            <section className={styles.impactRegion} aria-labelledby="priority-impact-heading">
              <h3 className={styles.regionTitle} id="priority-impact-heading">
                {t('priority.impactTitle')}
              </h3>
              <p className={styles.impactLead}>{t('priority.impactLead')}</p>
              <ul className={styles.impactPills}>
                {priority.impacts.map((impactKey) => (
                  <li key={impactKey} className={styles.impactPill}>
                    <span className={styles.impactPillIcon} aria-hidden="true">
                      {impactKey.includes('coldChain') ? (
                        <Snowflake size={16} strokeWidth={2} />
                      ) : impactKey.includes('document') ? (
                        <ClipboardCheck size={16} strokeWidth={2} />
                      ) : impactKey.includes('docking') ? (
                        <Anchor size={16} strokeWidth={2} />
                      ) : (
                        <TrendingDown size={16} strokeWidth={2} />
                      )}
                    </span>
                    <span className={styles.impactPillText}>{t(impactKey)}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </>
      )}

      {!hasActions ? (
        <section className={styles.impactRegion} aria-labelledby="priority-impact-heading-empty">
          <h3 className={styles.regionTitle} id="priority-impact-heading-empty">
            {t('priority.impactTitle')}
          </h3>
          <p className={styles.impactLead}>{t('priority.impactLead')}</p>
          <ul className={styles.impactPills}>
            {priority.impacts.map((impactKey) => (
              <li key={impactKey} className={styles.impactPill}>
                <span className={styles.impactPillIcon} aria-hidden="true">
                  {impactKey.includes('coldChain') ? (
                    <Snowflake size={16} strokeWidth={2} />
                  ) : impactKey.includes('document') ? (
                    <ClipboardCheck size={16} strokeWidth={2} />
                  ) : impactKey.includes('docking') ? (
                    <Anchor size={16} strokeWidth={2} />
                  ) : (
                    <TrendingDown size={16} strokeWidth={2} />
                  )}
                </span>
                <span className={styles.impactPillText}>{t(impactKey)}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
