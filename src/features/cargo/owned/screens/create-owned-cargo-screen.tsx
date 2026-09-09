'use client';

import { useActionState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/core/i18n/navigation';
import { MobileAppShell } from '@/features/product-shell/components/mobile-app-shell/mobile-app-shell';
import { PrimaryButton } from '@/features/product-shell/components/primary-button/primary-button';
import {
  createOwnedCargoAction,
  type CreateOwnedCargoActionState,
} from '@/features/cargo/owned/actions/create-owned-cargo-action';

import styles from './create-owned-cargo-screen.module.sass';

const initialCreateCargoState: CreateOwnedCargoActionState = { status: 'idle' };

export function CreateCargoScreen() {
  const t = useTranslations('shipperMobileFlow.newCargo');
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createOwnedCargoAction, initialCreateCargoState);

  useEffect(() => {
    if (state.status !== 'success') return;
    router.push(`/minhas-cargas/${state.cargoId}`);
    router.refresh();
  }, [router, state]);

  return (
    <MobileAppShell title={t('title')} backHref="/minhas-cargas" forceHideBottomNav>
      <form className={styles.form} action={formAction}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="origin">{t('origin')}</label>
          <input id="origin" name="origin" className={styles.input} defaultValue="Porto Velho" required />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="destination">{t('destination')}</label>
          <input id="destination" name="destination" className={styles.input} defaultValue="Miritituba / Itaituba" required />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="type">{t('type')}</label>
          <select id="type" name="cargoType" className={styles.select} defaultValue="solid" required>
            <option value="solid">{t('types.solid')}</option>
            <option value="general">{t('types.general')}</option>
            <option value="container">{t('types.container')}</option>
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="window">{t('window')}</label>
          <input id="window" name="window" className={styles.input} placeholder={t('windowPlaceholder')} required />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="draft">{t('draft')}</label>
          <input id="draft" name="draft" className={styles.input} defaultValue="2.4" inputMode="decimal" required />
        </div>
        <article className={styles.alert} style={{ borderLeftColor: 'var(--hy-shipper-success)' }}>
          <h3 className={styles.alertTitle}>{t('impactPreview.title')}</h3>
          <p className={styles.alertBody}>{t('impactPreview.body')}</p>
        </article>
        {state.status === 'error' ? (
          <p className={styles.error} role="alert">
            {t(state.code === 'missing-fields' ? 'errors.window' : 'errors.submit')}
          </p>
        ) : null}
        <PrimaryButton label={t('submit')} type="submit" state={pending ? 'loading' : state.status === 'success' ? 'success' : state.status === 'error' ? 'error' : 'idle'} />
      </form>
    </MobileAppShell>
  );
}
