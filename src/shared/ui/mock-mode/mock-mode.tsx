'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { HydroIcon } from '@/shared/ui/hydro-icon/hydro-icon';
import { MockScenarioControl } from './mock-scenario-control';
import { MockQaHubPersonas } from './mock-qa-hub';
import { MockQaAssistant } from './mock-qa-assistant';
import styles from './mock-mode.module.scss';

export function MockMode() {
  const t = useTranslations('mockMode');
  const [open, setOpen] = useState(false);

  return (
    <aside className={`${styles.shell} ${open ? styles.open : ''}`} aria-label={t('title')}>
      {open ? (
        <div className={styles.panel}>
          <div className={styles.header}>
            <div>
              <strong>{t('title')}</strong>
              <small>{t('subtitle')}</small>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label={t('close')}>
              <HydroIcon name="close" size={18} />
            </button>
          </div>

          <MockQaAssistant />

          <MockScenarioControl />

          <section className={styles.section}>
            <div className={styles.sectionTitle}>
              <HydroIcon name="users" size={16} />
              <span>{t('qaHub.sectionTitle')}</span>
            </div>
            <p className={styles.qaHubLead}>{t('qaHub.sectionLead')}</p>
            <MockQaHubPersonas />
          </section>
        </div>
      ) : null}

      <button
        type="button"
        className={styles.trigger}
        data-testid="mock-mode-toggle"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={t('button')}
      >
        <span className={styles.triggerMark}>{t('triggerMark')}</span>
        <span>{t('qaAssistantShortTitle')}</span>
      </button>
    </aside>
  );
}
