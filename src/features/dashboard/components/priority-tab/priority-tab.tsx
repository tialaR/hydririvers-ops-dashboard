import { useTranslations } from 'next-intl';
import { Anchor, AlertTriangle, Clock3, FileText, Gauge, Route, Signal, Thermometer } from 'lucide-react';
import type { Cargo } from '@/features/marketplace/domain/marketplace.types';
import { Badge } from '@/shared/ui/badge/badge';
import { Button } from '@/shared/ui/button/button';
import { getCargoPriority } from '@/features/cargo/utils/cargo-priority';
import type { CargoPriorityChecklistItem } from '@/features/cargo/types/cargo-priority.types';
import styles from './priority-tab.module.scss';

const iconByName = {
  alert: AlertTriangle,
  clock: Clock3,
  route: Route,
  document: FileText,
  temperature: Thermometer,
  signal: Signal,
  anchor: Anchor,
  gauge: Gauge
} as const;

function checklistTone(status: CargoPriorityChecklistItem['status']) {
  if (status === 'done') return 'done';
  if (status === 'inProgress') return 'progress';
  return 'pending';
}

export function PriorityTab({ cargo }: { cargo: Cargo }) {
  const t = useTranslations('operationsBoard');
  const priority = cargo.priority ?? getCargoPriority(cargo);
  const hasActions = priority.actions.length > 0;

  return (
    <div className={styles.panel}>
      <section className={styles.header}>
        <div className={styles.eyebrow}>
          <Badge tone={priority.level === 'high' ? 'warning' : priority.level === 'medium' ? 'river' : 'success'}>
            {t(priority.badgeLabelKey)}
          </Badge>
          <span className={styles.score}><b>{priority.score}/100</b> {t('priority.scoreLabel')}</span>
        </div>
        <h2 className={styles.title}>{t('priority.title')}</h2>
        <p className={styles.subtitle}>{t('priority.subtitle')}</p>
        <p className={styles.scoreNote}>{t(priority.scoreNoteKey)}</p>
      </section>

      <section className={styles.summaryGrid} aria-label={t('priority.summaryAria')}>
        {priority.summary.map((item) => {
          const Icon = iconByName[item.icon as keyof typeof iconByName] ?? Gauge;
          return (
            <article className={styles.summaryCard} key={item.id}>
              <div className={styles.summaryCardHeader}>
                <strong>{t(item.titleKey)}</strong>
                <Icon size={16} aria-hidden="true" />
              </div>
              <span className={styles.summaryValue}>{t(item.valueKey)}</span>
              <p className={styles.summaryDescription}>{t(item.descriptionKey)}</p>
            </article>
          );
        })}
      </section>

      {hasActions ? (
        <section className={styles.actionsGrid} aria-label={t('priority.actionsAria')}>
          {priority.actions.map((action) => {
            const Icon = iconByName[action.icon as keyof typeof iconByName] ?? Gauge;
            return (
              <article className={styles.actionCard} key={action.id}>
                <div className={styles.actionTopline}>
                  <span className={styles.actionCategory}>{t(action.categoryKey)}</span>
                  <span className={styles.actionSeverity}>
                    <Badge tone={action.severity === 'high' ? 'warning' : action.severity === 'medium' ? 'river' : 'success'}>
                      {t(`priority.severity.${action.severity}`)}
                    </Badge>
                  </span>
                </div>
                <div className={styles.actionTopline}>
                  <Icon size={18} aria-hidden="true" />
                  <h3 className={styles.actionTitle}>{t(action.titleKey)}</h3>
                </div>
                <p className={styles.actionDescription}>{t(action.descriptionKey)}</p>
                <div className={styles.actionFooter}>
                  <strong>{t(`priority.actionStatus.${action.status}`)}</strong>
                  <Button variant="ghost">{t('priority.actionButton')}</Button>
                </div>
                <p className={styles.actionRecommendation}>{t(action.recommendationKey)}</p>
              </article>
            );
          })}
        </section>
      ) : (
        <div className={styles.emptyState}>
          <h3>{t(priority.emptyTitleKey)}</h3>
          <p>{t(priority.emptyDescriptionKey)}</p>
          <Button variant="secondary">{t(priority.emptyCtaLabelKey)}</Button>
        </div>
      )}

      <section className={styles.checklistImpact}>
        <article className={styles.checklistCard}>
          <h3 className={styles.sectionTitle}>{t('priority.checklistTitle')}</h3>
          <div className={styles.checklistList}>
            {priority.checklist.map((item) => (
              <div className={styles.checklistItem} key={item.id}>
                <span aria-hidden="true">{item.status === 'done' ? '✓' : item.status === 'inProgress' ? '•' : '○'}</span>
                <strong>{t(item.labelKey)}</strong>
                <small>{t(`priority.checklistStatus.${checklistTone(item.status)}`)}</small>
              </div>
            ))}
          </div>
        </article>

        <article className={styles.impactCard}>
          <h3 className={styles.sectionTitle}>{t('priority.impactTitle')}</h3>
          <div className={styles.impactList}>
            {priority.impacts.map((impact) => (
              <article key={impact}>{t(impact)}</article>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
