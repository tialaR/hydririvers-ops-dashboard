'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/core/i18n/navigation';
import { useAuthSession } from '@/features/auth/hooks/use-auth-session';
import type { MockScenarioId } from '@/shared/config/mock-scenario-ids';
import { apiRoutes } from '@/shared/routing/api-routes';
import { HydroIcon } from '@/shared/ui/hydro-icon/hydro-icon';
import {
  filterMockQaScenarios,
  formatMockQaScenarioClipboard,
  mockQaScenarios,
  type MockQaScenario
} from './mock-qa-scenarios';
import styles from './mock-mode.module.scss';

function getPriorityToneClass(priority: MockQaScenario['priority']) {
  if (priority === 'high') return styles.qaScenarioBadgehigh;
  if (priority === 'medium') return styles.qaScenarioBadgemedium;
  return styles.qaScenarioBadgelow;
}

type PersonaBucket = 'shipper' | 'carrier' | 'admin' | 'government' | 'visitor' | 'qa' | 'operations';
type JourneyBucket =
  | 'auth'
  | 'dashboard'
  | 'cargoes'
  | 'my-cargoes'
  | 'negotiations'
  | 'tracking'
  | 'notifications'
  | 'mobile'
  | 'theme'
  | 'impact'
  | 'government'
  | 'vessels'
  | 'other';

const personaBuckets: readonly PersonaBucket[] = ['shipper', 'carrier', 'admin', 'government', 'visitor', 'qa', 'operations'];
const journeyBuckets: readonly JourneyBucket[] = ['auth', 'dashboard', 'cargoes', 'my-cargoes', 'negotiations', 'tracking', 'notifications', 'mobile', 'theme', 'impact', 'government', 'vessels', 'other'];
const recommendedJourneyIds = [
  'auth-login-success',
  'dashboard-active-and-alert',
  'cargos-market-and-filters',
  'my-cargos-with-items',
  'notifications-unread-and-mark-all',
  'negotiations-flow',
  'tracking-map-active-and-overlay',
  'theme-and-i18n'
] as const;

function getPersonaBucket(scenario: MockQaScenario): PersonaBucket {
  const source = `${scenario.persona} ${scenario.title} ${scenario.description} ${scenario.tags.join(' ')}`.toLowerCase();
  if (source.includes('embarcador') || source.includes('shipper')) return 'shipper';
  if (source.includes('transportador') || source.includes('carrier') || source.includes('frota')) return 'carrier';
  if (source.includes('admin') || source.includes('operação interna')) return 'admin';
  if (source.includes('governo') || source.includes('government')) return 'government';
  if (source.includes('visitante')) return 'visitor';
  if (source.includes('qa')) return 'qa';
  return 'operations';
}

function getJourneyBucket(scenario: MockQaScenario): JourneyBucket {
  const values = [scenario.id, scenario.title, ...scenario.areas, ...scenario.tags, scenario.startRoute].join(' ').toLowerCase();
  if (values.includes('auth') || values.includes('login') || values.includes('register') || values.includes('otp')) return 'auth';
  if (values.includes('dashboard')) return 'dashboard';
  if (values.includes('my-cargos') || values.includes('minhas-cargas') || values.includes('owner')) return 'my-cargoes';
  if (values.includes('cargo') || values.includes('marketplace') || values.includes('filters')) return 'cargoes';
  if (values.includes('negotiation')) return 'negotiations';
  if (values.includes('tracking') || values.includes('map') || values.includes('route')) return 'tracking';
  if (values.includes('notification') || values.includes('badge') || values.includes('read-state')) return 'notifications';
  if (values.includes('mobile') || values.includes('bottom-sheet') || values.includes('safe-area')) return 'mobile';
  if (values.includes('theme') || values.includes('i18n') || values.includes('translations')) return 'theme';
  if (values.includes('impact')) return 'impact';
  if (values.includes('government')) return 'government';
  if (values.includes('vessel') || values.includes('fleet')) return 'vessels';
  return 'other';
}

function groupScenariosBy<TBucket extends string>(scenarios: readonly MockQaScenario[], bucketOf: (scenario: MockQaScenario) => TBucket, order: readonly TBucket[]) {
  const grouped = new Map<TBucket, MockQaScenario[]>();
  for (const bucket of order) grouped.set(bucket, []);
  for (const scenario of scenarios) {
    const bucket = bucketOf(scenario);
    const current = grouped.get(bucket) ?? [];
    current.push(scenario);
    grouped.set(bucket, current);
  }
  return order
    .map((bucket) => ({ bucket, items: grouped.get(bucket) ?? [] }))
    .filter((group) => group.items.length > 0);
}

export function MockQaAssistant() {
  const t = useTranslations('mockMode');
  const { user, ready } = useAuthSession();
  const isAdmin = ready && user?.role === 'admin';
  const [query, setQuery] = useState('');
  const [personaFilter, setPersonaFilter] = useState<'all' | PersonaBucket>('all');
  const [journeyFilter, setJourneyFilter] = useState<'all' | JourneyBucket>('all');
  const [copiedScenarioId, setCopiedScenarioId] = useState<string | null>(null);
  const [pendingDatasetId, setPendingDatasetId] = useState<MockScenarioId | null>(null);
  const [datasetApplyError, setDatasetApplyError] = useState(false);

  async function applyDataset(datasetScenarioId: MockScenarioId) {
    setDatasetApplyError(false);
    setPendingDatasetId(datasetScenarioId);
    try {
      const res = await fetch(apiRoutes.mockMode.root, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ scenario: datasetScenarioId })
      });
      if (!res.ok) {
        setDatasetApplyError(true);
        return;
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('hydrorivers:mock-changed'));
      }
    } catch {
      setDatasetApplyError(true);
    } finally {
      setPendingDatasetId(null);
    }
  }

  const filteredScenarios = useMemo(() => {
    const byQuery = filterMockQaScenarios(query);
    return byQuery.filter((scenario) => {
      const personaBucket = getPersonaBucket(scenario);
      const journeyBucket = getJourneyBucket(scenario);
      if (personaFilter !== 'all' && personaBucket !== personaFilter) return false;
      if (journeyFilter !== 'all' && journeyBucket !== journeyFilter) return false;
      return true;
    });
  }, [journeyFilter, personaFilter, query]);
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
  const groupedScenarios = useMemo(() => groupScenariosBy(filteredScenarios, getJourneyBucket, journeyBuckets), [filteredScenarios]);
  const recommendedJourney = useMemo(() => {
    return recommendedJourneyIds.reduce<MockQaScenario[]>((acc, id) => {
      const scenario = mockQaScenarios.find((item) => item.id === id);
      if (scenario) acc.push(scenario);
      return acc;
    }, []);
  }, []);
  const resetFilters = () => {
    setQuery('');
    setPersonaFilter('all');
    setJourneyFilter('all');
  };

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
      {datasetApplyError ? (
        <p className={styles.scenarioError} role="alert" data-testid="qa-assistant-dataset-error">
          {t('qaAssistant.datasetApplyError')}
        </p>
      ) : null}
      {!isAdmin && ready ? (
        <p className={styles.qaAssistantAdminHint} data-testid="qa-assistant-admin-only-hint">
          {t('qaAssistant.datasetApplyAdminOnly')}
        </p>
      ) : null}

      <section className={styles.qaJourneyPanel} aria-label={t('qaAssistant.recommendedJourneyTitle')}>
        <div className={styles.qaJourneyPanelHeader}>
          <strong>{t('qaAssistant.recommendedJourneyTitle')}</strong>
          <span>{t('qaAssistant.recommendedJourneyLead')}</span>
        </div>
        <ol className={styles.qaJourneyList}>
          {recommendedJourney.map((scenario, index) => (
            <li key={scenario.id} className={styles.qaJourneyItem}>
              <span className={styles.qaJourneyStep}>{index + 1}</span>
              <div className={styles.qaJourneyCopy}>
                <strong>{scenario.title}</strong>
                <small>{scenario.persona}</small>
              </div>
              <Link href={scenario.startRoute} className={styles.qaJourneyLink}>
                {t('qaAssistant.openRoute')}
              </Link>
            </li>
          ))}
        </ol>
      </section>

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
        <div className={styles.qaAssistantFilters}>
          <div className={styles.qaAssistantFilterGroup} role="tablist" aria-label={t('qaAssistant.personaFilterLabel')}>
            <span className={styles.qaAssistantFilterLabel}>{t('qaAssistant.personaFilterLabel')}</span>
            <button type="button" className={personaFilter === 'all' ? styles.qaAssistantFilterButtonActive : styles.qaAssistantFilterButton} onClick={() => setPersonaFilter('all')}>
              {t('qaAssistant.filterAll')}
            </button>
            {personaBuckets.map((bucket) => (
              <button
                key={bucket}
                type="button"
                className={personaFilter === bucket ? styles.qaAssistantFilterButtonActive : styles.qaAssistantFilterButton}
                onClick={() => setPersonaFilter(bucket)}
              >
                {t(`qaAssistant.personaGroups.${bucket}`)}
              </button>
            ))}
          </div>

          <div className={styles.qaAssistantFilterGroup} role="tablist" aria-label={t('qaAssistant.journeyFilterLabel')}>
            <span className={styles.qaAssistantFilterLabel}>{t('qaAssistant.journeyFilterLabel')}</span>
            <button type="button" className={journeyFilter === 'all' ? styles.qaAssistantFilterButtonActive : styles.qaAssistantFilterButton} onClick={() => setJourneyFilter('all')}>
              {t('qaAssistant.filterAll')}
            </button>
            {journeyBuckets.map((bucket) => (
              <button
                key={bucket}
                type="button"
                className={journeyFilter === bucket ? styles.qaAssistantFilterButtonActive : styles.qaAssistantFilterButton}
                onClick={() => setJourneyFilter(bucket)}
              >
                {t(`qaAssistant.journeyGroups.${bucket}`)}
              </button>
            ))}
          </div>
          {(query || personaFilter !== 'all' || journeyFilter !== 'all') ? (
            <button type="button" className={styles.qaAssistantResetFilters} onClick={resetFilters}>
              {t('qaAssistant.resetFilters')}
            </button>
          ) : null}
        </div>
      </div>

      {filteredScenarios.length ? (
        <div className={styles.qaScenarioGroups}>
          {groupedScenarios.map((group) => (
            <section key={group.bucket} className={styles.qaScenarioGroup}>
              <div className={styles.qaScenarioGroupHeader}>
                <div>
                  <strong>{t(`qaAssistant.journeyGroups.${group.bucket}`)}</strong>
                  <p>{t(`qaAssistant.journeyGroupDescriptions.${group.bucket}`)}</p>
                </div>
                <span className={styles.qaScenarioGroupCount}>{group.items.length}</span>
              </div>
              <div className={styles.qaScenarioList}>
                {group.items.map((scenario) => (
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
                <Link href={scenario.startRoute} className={styles.caseLink}>
                  {t('qaAssistant.openRoute')}
                </Link>
                <button
                  type="button"
                  className={styles.qaSecondaryBtn}
                  onClick={() => void copySteps(scenario)}
                >
                  {copiedScenarioId === scenario.id ? t('qaAssistant.copied') : t('qaAssistant.copySteps')}
                </button>
                {isAdmin ? (
                  <button
                    type="button"
                    className={styles.qaSecondaryBtn}
                    data-testid={`qa-apply-dataset-${scenario.id}`}
                    disabled={pendingDatasetId !== null}
                    onClick={() => void applyDataset(scenario.datasetScenarioId)}
                  >
                    {pendingDatasetId === scenario.datasetScenarioId
                      ? t('qaAssistant.applyingDataset')
                      : t('qaAssistant.applyDataset')}
                  </button>
                ) : null}
              </div>
            </article>
                ))}
              </div>
            </section>
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
