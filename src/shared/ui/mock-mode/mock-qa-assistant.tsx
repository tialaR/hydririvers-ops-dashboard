'use client';

import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/core/i18n/navigation';
import type { AppLocale } from '@/shared/routing/route-types';
import { HydroIcon } from '@/shared/ui/hydro-icon/hydro-icon';
import {
  filterMockQaScenarios,
  formatMockQaScenarioClipboard,
  mockQaScenarios,
  type MockQaScenario
} from './mock-qa-scenarios';
import { localizedAppPath } from '@/shared/routing/app-routes';
import styles from './mock-mode.module.scss';

function getPriorityToneClass(priority: MockQaScenario['priority']) {
  if (priority === 'high') return styles.qaScenarioBadgehigh;
  if (priority === 'medium') return styles.qaScenarioBadgemedium;
  return styles.qaScenarioBadgelow;
}

export function MockQaAssistant() {
  const t = useTranslations('mockMode');
  const locale = useLocale();
  const [query, setQuery] = useState('');
  const [copiedScenarioId, setCopiedScenarioId] = useState<string | null>(null);

  const filteredScenarios = useMemo(() => filterMockQaScenarios(query), [query]);
  const highCount = useMemo(
    () => mockQaScenarios.filter((scenario) => scenario.priority === 'high').length,
    []
  );
  const mediumCount = useMemo(
    () => mockQaScenarios.filter((scenario) => scenario.priority === 'medium').length,
    []
  );
  const lowCount = useMemo(() => mockQaScenarios.filter((scenario) => scenario.priority === 'low').length, []);
  const readyCount = useMemo(
    () => mockQaScenarios.filter((scenario) => scenario.status === 'ready').length,
    []
  );
  const partialCount = useMemo(
    () => mockQaScenarios.filter((scenario) => scenario.status === 'partial').length,
    []
  );

  async function copySteps(scenario: MockQaScenario) {
    try {
      await navigator.clipboard.writeText(formatMockQaScenarioClipboard(scenario));
      setCopiedScenarioId(scenario.id);
      window.setTimeout(() => {
        setCopiedScenarioId((current) => (current === scenario.id ? null : current));
      }, 1800);
    } catch {
      setCopiedScenarioId(null);
    }
  }

  return (
    <section className={styles.section} data-testid="mock-qa-assistant-section">
      <div className={styles.sectionTitle}>
        <HydroIcon name="check" size={16} />
        <span>{t('qaAssistant.sectionTitle')}</span>
      </div>
      <p className={styles.qaHubLead}>{t('qaAssistant.sectionLead')}</p>

      <div className={styles.qaAssistantToolbar}>
        <label className={styles.qaAssistantSearchLabel} htmlFor="mock-qa-search">
          {t('qaAssistant.searchLabel')}
        </label>
        <div className={styles.qaAssistantSearchRow}>
          <input
            id="mock-qa-search"
            data-testid="mock-qa-search"
            className={styles.qaAssistantSearchInput}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('qaAssistant.searchPlaceholder')}
          />
          <span className={styles.qaAssistantSummary} aria-live="polite">
            {t('qaAssistant.summary', { count: filteredScenarios.length, total: mockQaScenarios.length })}
          </span>
        </div>
        <div className={styles.qaAssistantStats} aria-label={t('qaAssistant.searchLabel')}>
          <span className={styles.qaAssistantStat}>
            {t('qaAssistant.priorityLabels.high')} {highCount}
          </span>
          <span className={styles.qaAssistantStat}>
            {t('qaAssistant.priorityLabels.medium')} {mediumCount}
          </span>
          <span className={styles.qaAssistantStat}>
            {t('qaAssistant.priorityLabels.low')} {lowCount}
          </span>
          <span className={styles.qaAssistantStat}>
            {t('qaAssistant.statusLabels.ready')} {readyCount}
          </span>
          <span className={styles.qaAssistantStat}>
            {t('qaAssistant.statusLabels.partial')} {partialCount}
          </span>
        </div>
      </div>

      {filteredScenarios.length ? (
        <div className={styles.qaScenarioList}>
          {filteredScenarios.map((scenario) => (
            <article key={scenario.id} className={styles.qaScenarioCard} data-testid={`qa-scenario-${scenario.id}`}>
              <div className={styles.qaScenarioHeader}>
                <div className={styles.qaScenarioHeading}>
                  <strong>{scenario.title}</strong>
                  <p>{scenario.description}</p>
                </div>
                <div className={styles.qaScenarioBadges} aria-label={t('qaAssistant.priorityLabel')}>
                  <span className={`${styles.qaScenarioBadge} ${getPriorityToneClass(scenario.priority)}`}>
                    {t(`qaAssistant.priorityLabels.${scenario.priority}`)}
                  </span>
                  <span className={styles.qaScenarioBadge}>{t(`qaAssistant.statusLabels.${scenario.status}`)}</span>
                </div>
              </div>

              <dl className={styles.qaScenarioMeta}>
                <div>
                  <dt>{t('qaAssistant.objectiveLabel')}</dt>
                  <dd>{scenario.objective}</dd>
                </div>
                <div>
                  <dt>{t('qaAssistant.riskLabel')}</dt>
                  <dd>{scenario.riskCovered}</dd>
                </div>
                <div>
                  <dt>{t('qaAssistant.personaLabel')}</dt>
                  <dd>{scenario.persona}</dd>
                </div>
                <div>
                  <dt>{t('qaAssistant.routeLabel')}</dt>
                  <dd>{scenario.startRoute}</dd>
                </div>
                <div>
                  <dt>{t('qaAssistant.datasetLabel')}</dt>
                  <dd>{t(`scenarioIds.${scenario.datasetScenarioId}`)}</dd>
                </div>
                <div>
                  <dt>{t('qaAssistant.areasLabel')}</dt>
                  <dd>{scenario.areas.join(', ')}</dd>
                </div>
              </dl>

              <details className={styles.qaScenarioDetails} open>
                <summary>{t('qaAssistant.stepsLabel')}</summary>
                <ol>
                  {scenario.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
                <p className={styles.qaScenarioExpected}>
                  <strong>{t('qaAssistant.expectedLabel')}:</strong> {scenario.expectedResult}
                </p>
              </details>

              <div className={styles.qaScenarioTags} aria-label={t('qaAssistant.tagsLabel')}>
                {scenario.tags.map((tag) => (
                  <span key={tag} className={styles.qaScenarioTag}>
                    #{tag}
                  </span>
                ))}
              </div>

              <div className={styles.qaScenarioActions}>
                <Link href={localizedAppPath(locale as AppLocale, scenario.startRoute)} className={styles.caseLink}>
                  {t('qaAssistant.openRoute')}
                </Link>
                <button
                  type="button"
                  className={styles.qaSecondaryBtn}
                  onClick={() => void copySteps(scenario)}
                >
                  {copiedScenarioId === scenario.id ? t('qaAssistant.copied') : t('qaAssistant.copySteps')}
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className={styles.qaAssistantEmpty} role="status">
          <strong>{t('qaAssistant.emptyStateTitle')}</strong>
          <span>{t('qaAssistant.emptyStateDescription')}</span>
        </p>
      )}
    </section>
  );
}
