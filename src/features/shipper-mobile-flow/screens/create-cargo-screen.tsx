'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/core/i18n/navigation';
import { MobileAppShell } from '@/features/shipper-mobile-flow/components/mobile-app-shell/mobile-app-shell';
import { PrimaryButton } from '@/features/shipper-mobile-flow/components/primary-button/primary-button';
import type { ShipperCtaState } from '@/features/shipper-mobile-flow/types/shipper-flow-types';

import styles from '../components/shared-ui/shared-ui.module.sass';

export function CreateCargoScreen() {
  const t = useTranslations('shipperMobileFlow.newCargo');
  const router = useRouter();
  const [origin, setOrigin] = useState('Porto Velho');
  const [destination, setDestination] = useState('Miritituba / Itaituba');
  const [cargoType, setCargoType] = useState('solid');
  const [windowLabel, setWindowLabel] = useState('');
  const [draft, setDraft] = useState('2.4');
  const [error, setError] = useState('');
  const [ctaState, setCtaState] = useState<ShipperCtaState>('idle');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!windowLabel.trim()) {
      setError(t('errors.window'));
      return;
    }
    setCtaState('loading');
    window.setTimeout(() => {
      setCtaState('success');
      router.push('/minhas-cargas/hr-4821');
    }, 500);
  };

  return (
    <MobileAppShell title={t('title')} backHref="/minhas-cargas" forceHideBottomNav>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="origin">{t('origin')}</label>
          <input id="origin" className={styles.input} value={origin} onChange={(e) => setOrigin(e.target.value)} />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="destination">{t('destination')}</label>
          <input id="destination" className={styles.input} value={destination} onChange={(e) => setDestination(e.target.value)} />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="type">{t('type')}</label>
          <select id="type" className={styles.select} value={cargoType} onChange={(e) => setCargoType(e.target.value)}>
            <option value="solid">{t('types.solid')}</option>
            <option value="general">{t('types.general')}</option>
            <option value="container">{t('types.container')}</option>
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="window">{t('window')}</label>
          <input id="window" className={styles.input} value={windowLabel} onChange={(e) => setWindowLabel(e.target.value)} placeholder={t('windowPlaceholder')} />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="draft">{t('draft')}</label>
          <input id="draft" className={styles.input} value={draft} onChange={(e) => setDraft(e.target.value)} />
        </div>
        <article className={styles.alert} style={{ borderLeftColor: 'var(--hy-shipper-success)' }}>
          <h3 className={styles.alertTitle}>{t('impactPreview.title')}</h3>
          <p className={styles.alertBody}>{t('impactPreview.body')}</p>
        </article>
        {error ? <p className={styles.error} role="alert">{error}</p> : null}
        <PrimaryButton label={t('submit')} type="submit" state={ctaState} />
      </form>
    </MobileAppShell>
  );
}
